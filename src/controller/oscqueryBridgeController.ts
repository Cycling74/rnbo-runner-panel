import { parse as parseQuery } from "querystring";
import { OSCBundle, OSCMessage, readPacket, writePacket } from "osc";
import { initRunnerInfo, setRunnerInfoValue, setAppStatus, setConnectionEndpoint } from "../actions/appStatus";
import { AppDispatch, store } from "../lib/store";
import { ReconnectingWebsocket } from "../lib/reconnectingWs";
import { AppStatus, RunnerCmdMethod } from "../lib/constants";
import { OSCQueryRNBOState, OSCQueryRNBOInstance, OSCQueryRNBOJackConnections, OSCQueryRNBOPatchersState, OSCValue, OSCQueryRNBOInstancesMetaState, OSCQueryListValue } from "../lib/types";
import { addPatcherNode, deletePortAliases, initConnections, initNodes, removePatcherNode, setPortAliases, updateSetMetaFromRemote, updateSourcePortConnections, updateSystemOrControlPortInfo } from "../actions/graph";
import { initPatchers } from "../actions/patchers";
import { initRunnerConfig, updateRunnerConfig } from "../actions/settings";
import { initSets, setGraphSetLatest, initSetPresets, setGraphSetPresetLatest } from "../actions/sets";
import { initDataFiles } from "../actions/datafiles";
import { sleep } from "../lib/util";
import { getPatcherNodeByIndex } from "../selectors/graph";
import { updateInstanceDataRefValue, updateInstanceMessageOutputValue, updateInstanceMessages, updateInstanceParameterValue, updateInstanceParameterValueNormalized, updateInstanceParameters, updateInstancePresetEntries, updateInstancePresetLatest, updateInstancePresetInitial, updateInstanceParameterMeta } from "../actions/instances";
import { ConnectionType, PortDirection } from "../models/graph";
import { showNotification } from "../actions/notifications";
import { NotificationLevel } from "../models/notification";
import { initTransport, updateTransportStatus } from "../actions/transport";
import { v4 as uuidv4 } from "uuid";
import { JackInfoKeys } from "../models/runnerInfo";

const dispatch = store.dispatch as AppDispatch;

const FILE_READ_CHUNK_SIZE = 1024;

enum OSCQueryCommand {
	PATH_ADDED = "PATH_ADDED",
	PATH_REMOVED = "PATH_REMOVED",
	ATTRIBUTES_CHANGED = "ATTRIBUTES_CHANGED"
}

const portIOPathMatcher = /^\/rnbo\/jack\/info\/ports\/(?<type>audio|midi)\/(?<direction>sources|sinks)$/;
const portAliasPathMatcher = /^\/rnbo\/jack\/info\/ports\/aliases\/(?<port>.+)$/;
const patchersPathMatcher = /^\/rnbo\/patchers/;
const instancePathMatcher = /^\/rnbo\/inst\/(?<index>\d+)$/;
const instanceStatePathMatcher = /^\/rnbo\/inst\/(?<index>\d+)\/(?<content>params|messages\/in|messages\/out|presets|data_refs)\/(?<rest>\S+)/;
const instancePresetPathMatcher = /^\/rnbo\/inst\/(?<index>\d+)\/presets\/(?<property>loaded|initial)$/;
const connectionsPathMatcher = /^\/rnbo\/jack\/connections\/(?<type>audio|midi)\/(?<name>.+)$/;
const setMetaPathMatcher = /^\/rnbo\/inst\/control\/sets\/meta/;

// TODO const setsPresetsCurrentNamePath = "/rnbo/inst/control/sets/current/name";
const setsPresetsLoadPath = "/rnbo/inst/control/sets/presets/load";

const configPathMatcher = /^\/rnbo\/config\/(?<name>.+)$/;
const jackConfigPathMatcher = /^\/rnbo\/jack\/config\/(?<name>.+)$/;
const instanceConfigPathMatcher = /^\/rnbo\/inst\/config\/(?<name>.+)$/;

export class RunnerCmd {

	public readonly id = uuidv4();

	constructor(
		protected readonly method: RunnerCmdMethod,
		protected readonly params: any,
		public readonly timeout = 0 // 0 disables the timeout
	) {
	}

	public get hasTimeout(): boolean {
		return this.timeout > 0;
	}

	public get packet() : Uint8Array {
		return writePacket({
			address: "/rnbo/cmd",
			args: [
				{
					type: "s",
					value: JSON.stringify({
						id: this.id,
						jsonrpc: "2.0",
						method: this.method,
						params: this.params
					})
				}
			]
		},
		{ metadata: true });
	}
}

export class OSCQueryBridgeControllerPrivate {

	private _hasIsActive: boolean = false;

	private static instanceExists(index: number): boolean {
		return !!getPatcherNodeByIndex(store.getState(), index);
	}

	private _ws: ReconnectingWebsocket | null = null;

	private _requestState<T>(path: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			let resolved = false;
			const callback = (evt: MessageEvent): void => {
				try {
					if (resolved) return;
					if (typeof evt.data !== "string") return;
					const data = JSON.parse(evt.data);

					if (data?.FULL_PATH === path) {
						resolved = true;
						this._ws.off("message", callback);
						return void resolve(data as T);
					}
				} catch (err) {
					resolved = true;
					this._ws.off("message", callback);
					return void reject(err);
				}
			};
			this._ws.on("message", callback);
			this._ws.send(path);
		});
	}

	public sendCmd(cmd: RunnerCmd): Promise<any[]> {
		return new Promise<any[]>((resolve, reject) => {

			const responses: any[] = [];
			let resolved = false;
			let timeout: NodeJS.Timeout;

			// Reassigning cleanup later in order to allow access to both, cleanup and callback
			// eslint-disable-next-line prefer-const
			let cleanup: () => void | undefined;

			const callback = async (evt: MessageEvent): Promise<void> => {
				try {
					if (resolved) return;
					if (typeof evt !== "string") {
						let msg = readPacket(await evt.data.arrayBuffer(), { metadata: true });
						if (!msg.hasOwnProperty("address")) return;

						msg = msg as OSCMessage;
						if (msg.hasOwnProperty("address") && msg.address === "/rnbo/resp") {
							const resp = JSON.parse((msg as OSCMessage).args[0].value as string);
							if (resp.error) {
								throw new Error(resp.error);
							} else if (resp.result) {
								if (resp.id !== cmd.id) return;

								responses.push(resp.result);
								const p = parseInt(resp.result.progress, 10);

								if (p === 100) {
									cleanup?.();
									return void resolve(responses);
								}
							} else {
								throw new Error("unknown response packet: " + msg.args[0].value);
							}
						}
					}
				} catch (err) {
					cleanup?.();
					return void reject(err);
				}
			};

			if (cmd.hasTimeout) {
				timeout = setTimeout(() => {
					cleanup?.();
					return void reject(new Error(`Command timed out after ${cmd.timeout}ms`));
				}, cmd.timeout);
			}

			cleanup = () => {
				resolved = true;
				if (timeout !== undefined) clearTimeout(timeout);
				this._ws.off("message", callback);
			};

			this._ws.on("message", callback);
			this._ws.sendPacket(Buffer.from(cmd.packet));
		});
	}

	public async getMetaState(): Promise<OSCQueryRNBOInstancesMetaState> {
		const state = await this._requestState<OSCQueryRNBOInstancesMetaState>("/rnbo/inst/control/sets/meta");
		return state;
	}

	private async _initConnections() {
		const connectionsInfo = await this._requestState<OSCQueryRNBOJackConnections>("/rnbo/jack/connections");
		dispatch(initConnections(connectionsInfo));
	}

	private async _getDataFileList(): Promise<string[]> {
		let seq = 0;
		const filePaths: string[] = JSON.parse((await this.sendCmd(new RunnerCmd(RunnerCmdMethod.ReadFile, {
			filetype: "datafile",
			size: FILE_READ_CHUNK_SIZE
		}))).sort((a, b) => parseInt(a.seq, 10) - parseInt(b.seq, 10)).map(v => {
			if (v.seq === undefined || parseInt(v.seq, 10) !== seq) {
				throw new Error(`unexpected sequence number ${v.seq}`);
			}
			seq++;
			return v.content;
		}).join(""));
		return filePaths;
	}

	private async _initAudio(state: OSCQueryRNBOState) {
		// Init Transport
		dispatch(initTransport(state.CONTENTS.jack?.CONTENTS?.transport));

		// Init RunnerInfo
		dispatch(initRunnerInfo(state));

		// Initialize RNBO Graph Nodes
		dispatch(initNodes(state.CONTENTS.jack?.CONTENTS.info.CONTENTS.ports, state.CONTENTS.inst));

		// Fetch Connections Info
		await this._initConnections();

		// Set Init App Status
		dispatch(setAppStatus(AppStatus.Ready));
	}

	private async _init() {

		const state = await this._requestState<OSCQueryRNBOState>("/rnbo");

		// Init Config
		dispatch(initRunnerConfig(state));

		// Init RunnerInfo
		dispatch(initRunnerInfo(state));

		// Init Patcher Info
		dispatch(initPatchers(state.CONTENTS.patchers));

		// get sets info
		dispatch(initSets(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.load?.RANGE?.[0]?.VALS || []));
		dispatch(setGraphSetLatest(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.current?.CONTENTS?.name?.VALUE || ""));
		dispatch(initSetPresets(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.presets?.CONTENTS?.load?.RANGE?.[0]?.VALS || []));
		dispatch(setGraphSetPresetLatest(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.presets?.CONTENTS?.loaded?.VALUE || ""));

		// TODO could take a bit?
		try {
			dispatch(initDataFiles(await this._getDataFileList()));
		} catch (err) {
			console.error(err);
			dispatch(showNotification({
				title: "Error while requesting sample data",
				message: `${err.message} - Please check the console for more details`,
				level: NotificationLevel.error
			}));
		}

		this._hasIsActive  = state.CONTENTS.jack?.CONTENTS?.info?.CONTENTS?.is_active !== undefined;

		// don't init audio if jack isn't active
		if ((!this._hasIsActive && state.CONTENTS.jack?.CONTENTS?.active?.TYPE === "T") || state.CONTENTS.jack?.CONTENTS?.info?.CONTENTS?.is_active?.TYPE === "T") {
			await this._initAudio(state);
		} else {
			dispatch(setAppStatus(AppStatus.AudioOff));
		}

	}

	private _onClose = (evt: ErrorEvent) => {
		dispatch(setAppStatus(AppStatus.Closed, new Error("The connection to the RNBO Runner was closed")));
	};

	private _onError = (evt: ErrorEvent) => {
		dispatch(setAppStatus(AppStatus.Error, new Error(`The connection to the RNBO Runner encountered an error ${evt.error.message}`)));
	};

	private _onReconnecting = () => {
		dispatch(setAppStatus(AppStatus.Reconnecting));
	};

	private _onReconnected = () => {
		dispatch(setAppStatus(AppStatus.ResyncingState));
		this._init();
	};

	private _onMessage = async (evt: MessageEvent): Promise<void> => {
		try {

			if (typeof evt.data === "string") {
				const data = JSON.parse(evt.data);
				const isCommand = typeof data.COMMAND === "string" && ["string", "object"].includes(typeof data.DATA);

				// console.log("command", data);

				if (isCommand && data.COMMAND === OSCQueryCommand.PATH_ADDED) {
					await this._onPathAdded(data.DATA as string);
				} else if (isCommand && data.COMMAND === OSCQueryCommand.PATH_REMOVED) {
					await this._onPathRemoved(data.DATA as string);
				} else if (isCommand && data.COMMAND === OSCQueryCommand.ATTRIBUTES_CHANGED) {
					await this._onAttributesChanged(data.DATA as object);
				}
			} else {
				const buf: Uint8Array = await evt.data.arrayBuffer();
				const data = readPacket(buf, {});

				if (data.hasOwnProperty("address")) {
					await this._processOSCMessage(data as OSCMessage);
				} else {
					await this._processOSCBundle(data as OSCBundle);
				}

			}
		} catch (e) {
			console.error(e);
		}
	};

	private async _onPathAdded(path: string): Promise<void> {

		// Handle Instances and Patcher Nodes first
		if (instancePathMatcher.test(path)) {
			// New Instance Added - slight timeout to let the graph build on the runner first
			await sleep(500);
			const info = await this._requestState<OSCQueryRNBOInstance>(path);
			const meta = await this.getMetaState();
			dispatch(addPatcherNode(info, meta.VALUE as string));

			// Refresh Connections Info to include node
			return void await this._initConnections();
		}

		// Handle changes to patchers list - request updated list
		if (patchersPathMatcher.test(path)) {
			const patcherInfo = await this._requestState<OSCQueryRNBOPatchersState>("/rnbo/patchers");
			return void dispatch(initPatchers(patcherInfo));
		}

		// Handle Alias Additions
		const aliasMatch = path.match(portAliasPathMatcher);
		if (aliasMatch?.groups?.port) {
			const portAliases = await this._requestState<OSCQueryListValue<string, string[]>>(`/rnbo/jack/info/ports/aliases/${aliasMatch.groups.port}`);
			return void dispatch(setPortAliases(aliasMatch?.groups?.port, portAliases.VALUE));
		}

		// Parse out if instance path?
		const instInfoMatch = path.match(instanceStatePathMatcher);
		if (!instInfoMatch?.groups?.index) return;

		// Known Instance?
		const index = parseInt(instInfoMatch.groups.index, 10);
		if (isNaN(index) || !OSCQueryBridgeControllerPrivate.instanceExists(index)) return;

		if (
			instInfoMatch.groups.content === "presets" &&
			instInfoMatch.groups.rest === "entries"
		) {
			// Updated Preset Entries
			const presetInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["presets"]>(`/rnbo/inst/${index}/presets`);
			return void dispatch(updateInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		} else if (
			instInfoMatch.groups.content === "params" &&
			!instInfoMatch.groups.rest.endsWith("/normalized") &&
			!instInfoMatch.groups.rest.endsWith("/meta")
		) {
			// Add Parameter
			const paramInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["params"]>(`/rnbo/inst/${index}/params`);
			return void dispatch(updateInstanceParameters(index, paramInfo));
		} else if (
			instInfoMatch.groups.content === "messages/in" || instInfoMatch.groups.content === "messages/out"
		) {
			// Add Message Inputs & Outputs
			const messagesInfo = await this._requestState<OSCQueryRNBOInstance["CONTENTS"]["messages"]>(`/rnbo/inst/${index}/messages`);
			return void dispatch(updateInstanceMessages(index, messagesInfo));
		}
	}

	private async _onPathRemoved(path: string): Promise<void> {

		// Removed Instance
		const instMatch = path.match(instancePathMatcher);
		if (instMatch?.groups?.index) {
			const index = parseInt(instMatch.groups.index, 10);
			if (isNaN(index)) return;
			return void dispatch(removePatcherNode(index));
		}

		// Removed Patcher
		if (patchersPathMatcher.test(path)) {
			const patcherInfo = await this._requestState<OSCQueryRNBOPatchersState>("/rnbo/patchers");
			return void dispatch(initPatchers(patcherInfo));
		}

		// Handle Alias Removals
		const aliasMatch = path.match(portAliasPathMatcher);
		if (aliasMatch?.groups?.port) {
			return void dispatch(deletePortAliases(aliasMatch?.groups?.port));
		}

		// Parse out if instance path?
		const instInfoMatch = path.match(instanceStatePathMatcher);
		if (!instInfoMatch?.groups?.index) return;

		// Known Instance?
		const index = parseInt(instInfoMatch.groups.index, 10);
		if (isNaN(index) || !OSCQueryBridgeControllerPrivate.instanceExists(index)) return;

		// Updated Preset Entries
		if (
			instInfoMatch.groups.content === "presets" &&
			instInfoMatch.groups.rest === "entries"
		) {
			const presetInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["presets"]>(`/rnbo/inst/${index}/presets`);
			return void dispatch(updateInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		}

		// Removed Parameter
		if (
			instInfoMatch.groups.content === "params" &&
			!instInfoMatch.groups.rest.endsWith("/normalized")
		) {
			const paramInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["params"]>(`/rnbo/inst/${index}/params`);
			return void dispatch(updateInstanceParameters(index, paramInfo));
		}

		// Removed Message Inport
		if (
			instInfoMatch.groups.content === "messages/in" || instInfoMatch.groups.content === "messages/out"
		) {
			const messagesInfo = await this._requestState<OSCQueryRNBOInstance["CONTENTS"]["messages"]>(`/rnbo/inst/${index}/messages`);
			return void dispatch(updateInstanceMessages(index, messagesInfo));
		}
	}

	private async _onAttributesChanged(data: any): Promise<void> {
		// console.log("ATTRIBUTES_CHANGED", data);
		if (data.FULL_PATH === "/rnbo/inst/control/sets/load" && data.RANGE !== undefined) {
			const sets: Array<string> = data.RANGE?.[0]?.VALS || [];
			dispatch(initSets(sets));
		}
		if (data.FULL_PATH === setsPresetsLoadPath) {
			const names: Array<string> = data.RANGE?.[0]?.VALS || [];
			dispatch(initSetPresets(names));
		}
	}

	private async _processOSCBundle(bundle: OSCBundle): Promise<void> {
		for (const packet of bundle.packets) {
			if (packet.hasOwnProperty("address")) {
				await this._processOSCMessage(packet as OSCMessage);
			} else {
				await this._processOSCBundle(packet as OSCBundle);
			}
		}
	}

	private async _handleActive(active: boolean, delay: boolean) {
		if (active) {
			if (delay) {
				await sleep(500);
			}
			const state = await this._requestState<OSCQueryRNBOState>("/rnbo");
			await this._initAudio(state);
		} else {
			dispatch(setAppStatus(AppStatus.AudioOff));
		}
	}

	private async _processOSCMessage(packet: OSCMessage): Promise<void> {

		if (packet.address === "/rnbo/jack/restart") {
			return void dispatch(showNotification({ title: "Restarting Jack", message: "Please wait while the Jack server is being restarted with the updated audio configuration settings.", level: NotificationLevel.info }));
		}

		if (packet.address === "/rnbo/jack/info/is_active") {
			this._hasIsActive = true;
			await this._handleActive((packet.args as unknown as [boolean])?.[0], false);
			return;
		}

		if (!this._hasIsActive && packet.address === "/rnbo/jack/active") {
			await this._handleActive((packet.args as unknown as [boolean])?.[0], true);
			return;
		}

		for (const key of JackInfoKeys) {
			if (packet.address === `/rnbo/jack/info/${key}`) {
				return void dispatch(setRunnerInfoValue(key, (packet.args as unknown as [number])?.[0] || 0.0));
			}
		}

		// Transport Control Control
		if (packet.address === "/rnbo/jack/transport/bpm") {
			if (packet.args?.length) return void dispatch(updateTransportStatus({ bpm: (packet.args as unknown as [number])?.[0] }));
		}

		if (packet.address === "/rnbo/jack/transport/rolling") {
			if (packet.args?.length) return void dispatch(updateTransportStatus({ rolling: (packet.args as unknown as [boolean])?.[0] }));
		}

		if (packet.address === "/rnbo/jack/transport/sync") {
			if (packet.args?.length) return void dispatch(updateTransportStatus({ sync: (packet.args as unknown as [boolean])?.[0] }));
		}

		// only sent when it changes so we don't care what the value, just read the list again
		if (packet.address === "/rnbo/info/datafile_dir_mtime") {
			try {
				return void dispatch(initDataFiles(await this._getDataFileList()));
			} catch (err) {
				console.error(err);
				dispatch(showNotification({
					title: "Error while requesting sample data",
					message: `${err.message} - Please check the console for more details`,
					level: NotificationLevel.error
				}));
			}
		}

		if (packet.address === "/rnbo/inst/control/sets/presets/loaded") {
			return void dispatch(setGraphSetPresetLatest((packet.args as unknown as [string])?.[0] || ""));
		}

		if (packet.address === "/rnbo/inst/control/sets/current/name") {
			return void dispatch(setGraphSetLatest((packet.args as unknown as [string])?.[0] || ""));
		}

		const metaMatch = packet.address.match(setMetaPathMatcher);
		if (metaMatch) {
			return void dispatch(updateSetMetaFromRemote(packet.args as unknown as string));
		}

		const instancePresetMatch = packet.address.match(instancePresetPathMatcher);
		if (instancePresetMatch) {
			if (packet.args.length === 1) {
				const name: string = packet.args[0] as unknown as string;
				const index: number = parseInt(instancePresetMatch.groups.index, 10);
				switch (instancePresetMatch.groups.property) {
					case "initial":
						return void dispatch(updateInstancePresetInitial(index, name));
					case "loaded":
						return void dispatch(updateInstancePresetLatest(index, name));
					default:
						break;
				}
			}
			return;
		}

		const portIOMatch = packet.address.match(portIOPathMatcher);
		if (portIOMatch) {
			const type: ConnectionType = portIOMatch.groups.type === "midi" ? ConnectionType.MIDI : ConnectionType.Audio;
			const direction: PortDirection = portIOMatch.groups.direction === "sinks" ? PortDirection.Sink : PortDirection.Source;
			return void dispatch(updateSystemOrControlPortInfo(type, direction, packet.args as unknown as string[]));
		}


		const connectionMatch = packet.address.match(connectionsPathMatcher);
		if (connectionMatch?.groups?.name) {
			return void dispatch(updateSourcePortConnections(connectionMatch.groups.name, packet.args as unknown as string[]));
		}

		// update configs
		if (
			configPathMatcher.test(packet.address) ||
			jackConfigPathMatcher.test(packet.address) ||
			instanceConfigPathMatcher.test(packet.address)
		) {
			if (packet.args.length) {
				return void dispatch(updateRunnerConfig(packet.address, packet.args[0] as unknown as string | number | boolean));
			}
		}

		const packetMatch = packet.address.match(instanceStatePathMatcher);
		if (!packetMatch?.groups?.index) return;

		const index = parseInt(packetMatch.groups.index, 10);
		if (isNaN(index)) return;

		// Parameter Changes
		if (
			packetMatch.groups.content === "params" && packetMatch.groups.rest.endsWith("/normalized")
		) {
			// Normalized Value Update
			const name = packetMatch.groups.rest.split("/").slice(0, -1).join("/");
			if (!name || !packet.args.length || typeof packet.args[0] !== "number") return;
			return void dispatch(updateInstanceParameterValueNormalized(index, name, packet.args[0]));
		} else if (
			packetMatch.groups.content === "params" && packetMatch.groups.rest.endsWith("/meta")
		) {
			// Meta Update
			const name = packetMatch.groups.rest.split("/").slice(0, -1).join("/");
			return void dispatch(updateInstanceParameterMeta(index, name, packet.args[0] as unknown as string));
		} else if (
			packetMatch.groups.content === "params"
		) {
			// Value Update
			const name = packetMatch.groups.rest;
			if (!name || !packet.args.length || typeof packet.args[0] !== "number") return;
			return void dispatch(updateInstanceParameterValue(index, name, packet.args[0]));
		}

		// Preset changes
		if (
			packetMatch.groups.content === "presets" &&
			packetMatch.groups.rest === "entries"
		) {
			const presetInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["presets"]>(`/rnbo/inst/${index}/presets`);
			return void dispatch(updateInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		}

		// Output Messages
		if (
			packetMatch.groups.content === "messages/out" &&
			packetMatch.groups.rest?.length
		) {
			return void dispatch(updateInstanceMessageOutputValue(index, packetMatch.groups.rest, packet.args as any as OSCValue | OSCValue[]));
		}

		if (
			packetMatch.groups.content === "data_refs" &&
			packetMatch.groups.rest?.length
		) {

			if (packet.args.length >= 1 && typeof packet.args[0] === "string") {
				return void dispatch(updateInstanceDataRefValue(index, packetMatch.groups.rest, packet.args[0] as string));
			}
			console.log("unexpected dataref OSC packet format", { packet });

		}

	}

	public get hostname(): string {
		return this._ws.hostname;
	}

	public get port(): string {
		return this._ws.port;
	}

	public async connect({ hostname, port }: { hostname: string; port: string }): Promise<void> {

		this._ws = new ReconnectingWebsocket({ hostname, port });
		try {
			dispatch(setConnectionEndpoint(hostname, port));
			await this._ws.connect();
			dispatch(setAppStatus(AppStatus.InitializingState));

			this._ws.on("close", this._onClose);
			this._ws.on("error", this._onError);
			this._ws.on("reconnecting", this._onReconnecting);
			this._ws.on("reconnect", this._onReconnected);
			this._ws.on("reconnect_failed", this._onClose);
			this._ws.on("message", this._onMessage);

			await this._init();
		} catch (err) {
			dispatch(setAppStatus(AppStatus.Error, new Error(`Failed to connect to start up: ${err.message}`)));
			console.log(err);
			// Rethrow error
			throw err;
		}
	}

	public close(): void {
		this._ws?.close();
		this._ws?.removeAllListeners();
		this._ws = null;
	}

	public send(msg: string): void {
		this._ws?.send(msg);
	}

	public sendPacket(packet: any): void {
		this._ws?.sendPacket(Buffer.from(packet));
	}
}

export const parseConnectionQueryString = (qs: string): { hostname: string; port: string } => {
	const { h, p } = parseQuery(qs);
	return {
		hostname: !h ? location.hostname : Array.isArray(h) ? h[0] : h,
		port: !p || process.env.NODE_ENV === "development" ? "5678" : Array.isArray(p) ? p[0] : p
	};
};

// Singleton instance of a private class! we only export the type here.
export type OSCQueryBridgeController = InstanceType<typeof OSCQueryBridgeControllerPrivate>;
export const oscQueryBridge: OSCQueryBridgeController = new OSCQueryBridgeControllerPrivate() as OSCQueryBridgeController;
