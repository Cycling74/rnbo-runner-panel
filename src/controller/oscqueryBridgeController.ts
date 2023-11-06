import { parse as parseQuery } from "querystring";
import { OSCBundle, OSCMessage, readPacket } from "osc";
import { setAppStatus, setConnectionEndpoint } from "../actions/appStatus";
import { AppDispatch, store } from "../lib/store";
import { ReconnectingWebsocket } from "../lib/reconnectingWs";
import { AppStatus } from "../lib/constants";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancesState, OSCQueryRNBOJackPortInfo, OSCQueryRNBOPatchersState, OSCValue } from "../lib/types";
import { addPatcherNode, initGraph, removePatcherNode, updatePatcherNodeSinkPortConnections, updatePatcherNodeSourcePortConnections } from "../actions/graph";
import { initPatchers } from "../actions/patchers";
import { sleep } from "../lib/util";
import { getPatcherNodeByIndex } from "../selectors/graph";
import { updateDeviceInstanceMessageOutputValue, updateDeviceInstanceMessages, updateDeviceInstanceParameterValue, updateDeviceInstanceParameterValueNormalized, updateDeviceInstanceParameters, updateDeviceInstancePresetEntries } from "../actions/instances";

const dispatch = store.dispatch as AppDispatch;

enum OSCQueryCommand {
	PATH_ADDED = "PATH_ADDED",
	PATH_REMOVED = "PATH_REMOVED"
}

const instPathMatcher = /^\/rnbo\/inst\/(?<index>\d+)$/;
const patchersPathMatcher = /^\/rnbo\/patchers/;
const instInfoPathMatcher = /^\/rnbo\/inst\/(?<index>\d+)\/(?<content>params|messages\/in|messages\/out|presets)\/(?<rest>\S+)/;
const oscPacketAddressMatcher = /^\/rnbo\/inst\/(?<index>\d+)\/(?<content>params|presets|messages\/out|jack\/connections)\/(?<rest>\S+)/;

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

	private async _init() {

		// Fetch Patcher Info
		const patcherInfo = await this._requestState<OSCQueryRNBOPatchersState>("/rnbo/patchers");
		dispatch(initPatchers(patcherInfo));

		// Fetch System Jack Port Info
		const jackPortsInfo = await this._requestState<OSCQueryRNBOJackPortInfo>("/rnbo/jack/info/ports");

		// Fetch Instances Info
		const instancesInfo = await this._requestState<OSCQueryRNBOInstancesState>("/rnbo/inst");

		// Initialize RNBO Graph
		dispatch(initGraph(jackPortsInfo, instancesInfo));

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

				const isCommand = typeof data.COMMAND === "string" && typeof data.DATA === "string";

				if (isCommand && data.COMMAND === OSCQueryCommand.PATH_ADDED) {
					await this._onPathAdded(data.DATA as string);
				} else if (isCommand && data.COMMAND === OSCQueryCommand.PATH_REMOVED) {
					await this._onPathRemoved(data.DATA as string);
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
		if (instPathMatcher.test(path)) {
			// New Device Instance Added - slight timeout to let the graph build on the runner first
			await sleep(500);
			const info = await this._requestState<OSCQueryRNBOInstance>(path);
			return void dispatch(addPatcherNode(info));
		}

		// Handle changes to patchers list - request updated list
		if (patchersPathMatcher.test(path)) {
			const patcherInfo = await this._requestState<OSCQueryRNBOPatchersState>("/rnbo/patchers");
			return void dispatch(initPatchers(patcherInfo));
		}

		// Parse out if instance path?
		const instInfoMatch = path.match(instInfoPathMatcher);
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
		const instMatch = path.match(instPathMatcher);
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
		const instInfoMatch = path.match(instInfoPathMatcher);
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

		const packetMatch = packet.address.match(oscPacketAddressMatcher);
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

		// Update Instance Connections
		if (
			packetMatch.groups.content === "jack/connections" &&
			packetMatch.groups.rest?.length
		) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [type, direction, portId] = packetMatch.groups.rest.split("/");

			// Seems like we get [1] when no connections so filter to be a string-only array here
			const args: string[] = [];
			for (const arg of packet.args) {
				if (arg && typeof arg === "string") args.push(arg);
			}

			if (direction === "sources") {
				dispatch(updatePatcherNodeSourcePortConnections(index, portId, args));
			} else if (direction === "sinks") {
				dispatch(updatePatcherNodeSinkPortConnections(index, portId, args));
			}
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
