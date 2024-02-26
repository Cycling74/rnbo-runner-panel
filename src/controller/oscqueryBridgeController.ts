import { parse as parseQuery } from "querystring";
import { OSCBundle, OSCMessage, readPacket } from "osc";
import { setAppStatus, setConnectionEndpoint } from "../actions/appStatus";
import { AppDispatch, store } from "../lib/store";
import { ReconnectingWebsocket } from "../lib/reconnectingWs";
import { AppStatus } from "../lib/constants";
import { OSCQueryRNBOState, OSCQueryRNBOInstance, OSCQueryRNBOInstancesControlState, OSCQueryRNBOJackConnections, OSCQueryRNBOPatchersState, OSCValue } from "../lib/types";
import { addPatcherNode, initConnections, initNodes, removePatcherNode, updateSetMeta, updateSourcePortConnections } from "../actions/graph";
import { initPatchers } from "../actions/patchers";
import { initRunnerConfig, updateRunnerConfig } from "../actions/settings";
import { initSets } from "../actions/sets";
import { sleep } from "../lib/util";
import { getPatcherNodeByIndex } from "../selectors/graph";
import { updateDeviceInstanceMessageOutputValue, updateDeviceInstanceMessages, updateDeviceInstanceParameterValue, updateDeviceInstanceParameterValueNormalized, updateDeviceInstanceParameters, updateDeviceInstancePresetEntries } from "../actions/instances";

const dispatch = store.dispatch as AppDispatch;

enum OSCQueryCommand {
	PATH_ADDED = "PATH_ADDED",
	PATH_REMOVED = "PATH_REMOVED",
	ATTRIBUTES_CHANGED = "ATTRIBUTES_CHANGED"
}

const patchersPathMatcher = /^\/rnbo\/patchers/;
const instancePathMatcher = /^\/rnbo\/inst\/(?<index>\d+)$/;
const instanceStatePathMatcher = /^\/rnbo\/inst\/(?<index>\d+)\/(?<content>params|messages\/in|messages\/out|presets)\/(?<rest>\S+)/;
const connectionsPathMatcher = /^\/rnbo\/jack\/connections\/(?<type>audio|midi)\/(?<name>.+)$/;
const setMetaPathMatcher = /^\/rnbo\/inst\/control\/sets\/meta/;

const configPathMatcher = /^\/rnbo\/config\/(?<name>.+)$/;
const jackConfigPathMatcher = /^\/rnbo\/jack\/config\/(?<name>.+)$/;
const instanceConfigPathMatcher = /^\/rnbo\/inst\/config\/(?<name>.+)$/;

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

	private async _initConnections() {
		const connectionsInfo = await this._requestState<OSCQueryRNBOJackConnections>("/rnbo/jack/connections");
		dispatch(initConnections(connectionsInfo));
	}

	private async _init() {

		const state = await this._requestState<OSCQueryRNBOState>("/rnbo");

		// Init Config
		dispatch(initRunnerConfig(state));

		// Init Patcher Info
		dispatch(initPatchers(state.CONTENTS.patchers));

		// get sets info
		dispatch(initSets(state.CONTENTS.inst?.CONTENTS?.control?.CONTENTS?.sets?.CONTENTS?.load?.RANGE?.[0]?.VALS || []));

		// Initialize RNBO Graph Nodes
		dispatch(initNodes(state.CONTENTS.jack.CONTENTS.info.CONTENTS.ports, state.CONTENTS.inst));

		// Fetch Connections Info
		await this._initConnections();

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
			// New Device Instance Added - slight timeout to let the graph build on the runner first
			await sleep(500);
			const info = await this._requestState<OSCQueryRNBOInstance>(path);
			const meta = await this._requestState<OSCQueryRNBOInstancesControlState["CONTENTS"]["sets"]["CONTENTS"]["meta"]>("/rnbo/inst/control/sets/meta");
			dispatch(addPatcherNode(info, meta.VALUE as string));

			// Refresh Connections Info to include node
			return void await this._initConnections();
		}

		// Handle changes to patchers list - request updated list
		if (patchersPathMatcher.test(path)) {
			const patcherInfo = await this._requestState<OSCQueryRNBOPatchersState>("/rnbo/patchers");
			return void dispatch(initPatchers(patcherInfo));
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
			return void dispatch(updateDeviceInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		} else if (
			instInfoMatch.groups.content === "params" &&
			!instInfoMatch.groups.rest.endsWith("/normalized")
		) {
			// Add Parameter
			const paramInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["params"]>(`/rnbo/inst/${index}/params`);
			return void dispatch(updateDeviceInstanceParameters(index, paramInfo));
		} else if (
			instInfoMatch.groups.content === "messages/in" || instInfoMatch.groups.content === "messages/out"
		) {
			// Add Message Inputs & Outputs
			const messagesInfo = await this._requestState<OSCQueryRNBOInstance["CONTENTS"]["messages"]>(`/rnbo/inst/${index}/messages`);
			return void dispatch(updateDeviceInstanceMessages(index, messagesInfo));
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
			return void dispatch(updateDeviceInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		}

		// Removed Parameter
		if (
			instInfoMatch.groups.content === "params" &&
			!instInfoMatch.groups.rest.endsWith("/normalized")
		) {
			const paramInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["params"]>(`/rnbo/inst/${index}/params`);
			return void dispatch(updateDeviceInstanceParameters(index, paramInfo));
		}

		// Removed Message Inport
		if (
			instInfoMatch.groups.content === "messages/in" || instInfoMatch.groups.content === "messages/out"
		) {
			const messagesInfo = await this._requestState<OSCQueryRNBOInstance["CONTENTS"]["messages"]>(`/rnbo/inst/${index}/messages`);
			return void dispatch(updateDeviceInstanceMessages(index, messagesInfo));
		}
	}

	private async _onAttributesChanged(data: any): Promise<void> {
		// console.log("ATTRIBUTES_CHANGED", data);
		if (data.FULL_PATH === "/rnbo/inst/control/sets/load" && data.RANGE !== undefined) {
			const sets: Array<string> = data.RANGE?.[0]?.VALS || [];
			dispatch(initSets(sets));
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

		const metaMatch = packet.address.match(setMetaPathMatcher);
		if (metaMatch) {
			return void dispatch(updateSetMeta(packet.args as unknown as string));
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
				? dispatch(updateDeviceInstanceParameterValueNormalized(index, name, packet.args[0]))
				: dispatch(updateDeviceInstanceParameterValue(index, name, packet.args[0]));

			return;
		}

		// Preset changes
		if (
			packetMatch.groups.content === "presets" &&
			packetMatch.groups.rest === "entries"
		) {
			const presetInfo = await this._requestState< OSCQueryRNBOInstance["CONTENTS"]["presets"]>(`/rnbo/inst/${index}/presets`);
			return void dispatch(updateDeviceInstancePresetEntries(index, presetInfo.CONTENTS.entries));
		}

		// Output Messages
		if (
			packetMatch.groups.content === "messages/out" &&
			packetMatch.groups.rest?.length
		) {
			return void dispatch(updateDeviceInstanceMessageOutputValue(index, packetMatch.groups.rest, packet.args as any as OSCValue | OSCValue[]));
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
