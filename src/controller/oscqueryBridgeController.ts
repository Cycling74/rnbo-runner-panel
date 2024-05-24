import { parse as parseQuery } from "querystring";
import { OSCBundle, OSCMessage, readPacket, writePacket } from "osc";
import { setAppStatus, setConnectionEndpoint } from "../actions/appStatus";
import { AppDispatch, store } from "../lib/store";
import { ReconnectingWebsocket } from "../lib/reconnectingWs";
import { AppStatus } from "../lib/constants";
import { OSCQueryRNBOState, OSCQueryRNBOInstance, OSCQueryRNBOJackConnections, OSCQueryRNBOPatchersState, OSCValue, OSCQueryRNBOInstancesMetaState, OSCQueryListValue } from "../lib/types";
import { addPatcherNode, deletePortAliases, initConnections, initNodes, removePatcherNode, setPortAliases, updateSetMetaFromRemote, updateSourcePortConnections, updateSystemOrControlPortInfo } from "../actions/graph";
import { initPatchers } from "../actions/patchers";
import { initRunnerConfig, updateRunnerConfig } from "../actions/settings";
import { initSets, initSetPresets } from "../actions/sets";
import { initDataFiles } from "../actions/datafiles";
import { sleep } from "../lib/util";
import { getPatcherNodeByIndex } from "../selectors/graph";
import { updateInstanceDataRefValue, updateInstanceMessageOutputValue, updateInstanceMessages, updateInstanceParameterValue, updateInstanceParameterValueNormalized, updateInstanceParameters, updateInstancePresetEntries } from "../actions/instances";
import { ConnectionType, PortDirection } from "../models/graph";
import { showNotification } from "../actions/notifications";
import { NotificationLevel } from "../models/notification";
import { initTransport, updateTransportStatus } from "../actions/transport";
import { v4 as uuidv4 } from "uuid";
import { basename } from "path";

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
const connectionsPathMatcher = /^\/rnbo\/jack\/connections\/(?<type>audio|midi)\/(?<name>.+)$/;
const setMetaPathMatcher = /^\/rnbo\/inst\/control\/sets\/meta/;

// TODO const setsPresetsCurrentNamePath = "/rnbo/inst/control/sets/current/name";
const setsPresetsLoadPath = "/rnbo/inst/control/sets/presets/load";

const configPathMatcher = /^\/rnbo\/config\/(?<name>.+)$/;
const jackConfigPathMatcher = /^\/rnbo\/jack\/config\/(?<name>.+)$/;
const instanceConfigPathMatcher = /^\/rnbo\/inst\/config\/(?<name>.+)$/;

class RunnerCmd {
	readonly id = uuidv4();
	constructor(
		readonly method: string,
		readonly params: any
	) {
	}

	packet() : Uint8Array {
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

	private _sendCmd(cmd: RunnerCmd): Promise<any[]> {
		// TODO add timeout
		return new Promise<any[]>((resolve, reject) => {
			const responces: any[] = [];
			let resolved = false;
			const callback = async (evt: MessageEvent): void => {
				try {
					if (resolved) return;
					if (typeof evt !== "string") {
						const msg = readPacket(await evt.data.arrayBuffer(), {metadata: true});
						if (msg.address === "/rnbo/resp") {
							const resp = JSON.parse(msg.args[0].value);
							if (resp.error) {
								throw new Error(resp.error);
							} else if (resp.result) {
								if (resp.id === cmd.id) {
									responces.push(resp.result);
									const p = parseInt(resp.result.progress, 10);
									if (p === 100) {
										resolved = true;
										this._ws.off("message", callback);
										resolve(responces);
										return;
									}
								}
							} else {
								reject(new Error("unknown response packet: " + msg.args[0].value));
								return;
							}
						}
					}
				} catch (err) {
					resolved = true;
					this._ws.off("message", callback);
					return void reject(err);
				}
			};
			this._ws.on("message", callback);
			this._ws.send(cmd.packet());
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
		const files: string[] = JSON.parse((await this._sendCmd(new RunnerCmd("file_read", {
			filetype: "datafile",
			size: FILE_READ_CHUNK_SIZE
		}))).sort((a, b) => parseInt(a.seq, 10) - parseInt(b.seq, 10)).map(v => {
			if (v.seq === undefined || parseInt(v.seq, 10) !== seq) {
				throw new Error(`unexpected sequence number ${v.seq}`);
			}
			seq++;
			return v.content;
		}).join("")).map(p => basename(p));
		return files;
	}

	private async _init() {

		const state = await this._requestState<OSCQueryRNBOState>("/rnbo");

		// Init Config
		dispatch(initRunnerConfig(state));

		// Init Transport
		dispatch(initTransport(state.CONTENTS.jack.CONTENTS?.transport));

		// Init Patcher Info
		dispatch(initPatchers(state.CONTENTS.patchers));

		// get sets info
		dispatch(initSets(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.load?.RANGE?.[0]?.VALS || []));
		dispatch(initSetPresets(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.presets?.CONTENTS?.load?.RANGE?.[0]?.VALS || []));

		// Initialize RNBO Graph Nodes
		dispatch(initNodes(state.CONTENTS.jack.CONTENTS.info.CONTENTS.ports, state.CONTENTS.inst));

		// Fetch Connections Info
		await this._initConnections();

		// TODO could take a bit?
		try {
			dispatch(initDataFiles(await this._getDataFileList()));
		} catch(e) {
			console.error("error getting datafiles", { e });
		}

		// Set Init App Status
		dispatch(setAppStatus(AppStatus.Ready));
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
			!instInfoMatch.groups.rest.endsWith("/normalized")
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

	private async _processOSCMessage(packet: OSCMessage): Promise<void> {

		if (packet.address === "/rnbo/jack/restart") {
			return void dispatch(showNotification({ title: "Restarting Jack", message: "Please wait while the Jack server is being restarted with the updated audio configuration settings.", level: NotificationLevel.info }));
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
			return void dispatch(initDataFiles(await this._getDataFileList()));
		}

		const metaMatch = packet.address.match(setMetaPathMatcher);
		if (metaMatch) {
			return void dispatch(updateSetMetaFromRemote(packet.args as unknown as string));
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
		if (packetMatch.groups.content === "params") {
			const isNormalized = packetMatch.groups.rest.endsWith("/normalized");
			const name = isNormalized ? packetMatch.groups.rest.split("/").slice(0, -1).join("/") : packetMatch.groups.rest;
			if (!name || !packet.args.length || typeof packet.args[0] !== "number") return;

			isNormalized
				? dispatch(updateInstanceParameterValueNormalized(index, name, packet.args[0]))
				: dispatch(updateInstanceParameterValue(index, name, packet.args[0]));

			return;
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
