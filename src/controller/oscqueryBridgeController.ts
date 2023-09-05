import { parse as parseQuery } from "querystring";
import { readPacket } from "osc";
import {
	initializeDevice, initializePatchers,
	setSelectedPatcher, setParameterValue, setParameterValueNormalized,
	updatePresets
} from "../actions/device";
import { clearEntities, deleteEntity, setEntity } from "../actions/entities";
import { setConnectionStatus } from "../actions/network";
import { AppDispatch, store } from "../lib/store";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { EntityType } from "../reducers/entities";
import { ReconnectingWebsocket } from "../lib/reconnectingWs";
import { WebSocketState } from "../lib/constants";
import { UNLOAD_PATCHER_NAME } from "../models/patcher";

const dispatch = store.dispatch as AppDispatch;
export class OSCQueryBridgeControllerPrivate {

	private _ws: ReconnectingWebsocket | null = null;

	private get readyState(): WebSocketState {
		return this._ws?.readyState || WebSocketState.CLOSED;
	}

	private _onClose = (evt: ErrorEvent) => {
		dispatch(setConnectionStatus(this.readyState));
	};

	private _onError = (evt: ErrorEvent) => {
		dispatch(setConnectionStatus(this.readyState));
	};

	private _onReconnecting = () => {
		dispatch(setConnectionStatus(this.readyState));
	}

	private _onReconnected = () => {
		dispatch(setConnectionStatus(this.readyState));
	}

	private _onMessage = async (evt: MessageEvent): Promise<void> => {
		try {

			if (typeof evt.data === "string") {
				const data = JSON.parse(evt.data);

				const pathisstring = typeof data.FULL_PATH === "string";
				if (pathisstring && data.FULL_PATH === "/rnbo/inst/0" && (typeof data.CONTENTS !== "undefined")) {
					// brand new device
					dispatch(initializeDevice(data));
				} else if (pathisstring && data.FULL_PATH === "/rnbo/patchers" && (typeof data.CONTENTS !== "undefined")) {
					dispatch(initializePatchers(data));
				} else if (pathisstring && data.FULL_PATH === "/rnbo/inst/0/name") {
					dispatch(setSelectedPatcher(data.VALUE));
				} else if (pathisstring && data.FULL_PATH.startsWith("/rnbo/inst/0/params")) {

					// individual parameter
					const paramMatcher = /\/rnbo\/inst\/0\/params\/(\S+)/;
					let matches = data.FULL_PATH.match(paramMatcher);

					// If it's a new parameter, fetch its data
					if (matches) {
						const paramPath = matches[1];
						const params = ParameterRecord.arrayFromDescription(data, paramPath);
						if (params.length) dispatch(setEntity(EntityType.ParameterRecord, params[0]));
					}
				// need to add cond to check for preset and then set entity
				} else if (pathisstring && data.FULL_PATH === "/rnbo/inst/0/presets/entries") {
					dispatch(updatePresets(data.VALUE));
				} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_ADDED") {
					this._onPathAdded(data.DATA);
				} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_REMOVED") {
					this._onPathRemoved(data.DATA);
				} else {
					// unhandled message
					// console.log("unhandled", { data });
				}
			} else {
				const buf: Uint8Array = await evt.data.arrayBuffer();
				const message = readPacket(buf, {});
				this._processOSCMessage(message);
			}
		} catch (e) {
			console.error(e);
		}
	}

	private _onPathAdded(path: string): void {
		//console.log("path added", { path });
		//request data from new paths
		if (path.startsWith("/rnbo/patchers")) {
			this._ws.send("/rnbo/patchers");
			return;
		} else if (path === "/rnbo/inst/0/name") {
			this._ws.send(path);
			return;
		}

		const matcher = /\/rnbo\/inst\/0\/(params|messages\/in|presets)\/(\S+)/;
		const matches = path.match(matcher);
		if (!matches) return;

		// Fetch new parameters
		if (matches[1] === "params" && !matches[2].endsWith("/normalized")) {
			this._ws.send(path);
		} else if (matches[1] === "messages/in") {
			// Inports can be declared with just a name
			dispatch(setEntity(EntityType.InportRecord, new InportRecord({ name: matches[2] })));
		} else if (matches[1] === "presets" && matches[2] === "entries") {
			//request them
			this._ws.send(path);
		}
	}

	private _onPathRemoved(path: string): void {
		//if we remove the instance, patcher is gone
		if (path === "/rnbo/inst/0") {
			dispatch(setSelectedPatcher(UNLOAD_PATCHER_NAME));
			return;
		}
		const matcher = /\/rnbo\/inst\/0\/(params|messages\/in|presets)\/(\S+)/;
		const matches = path.match(matcher);
		if (!matches) return;

		if (matches[1] === "params") {
			const paramPath = matches[2];
			if (!paramPath.endsWith("/normalized")) {
				dispatch(deleteEntity(EntityType.ParameterRecord, paramPath));
			}
		} else if (matches[1] === "messages/in") {
			const inPath = matches[2];
			dispatch(deleteEntity(EntityType.InportRecord, inPath));
		} else if (matches[1] === "presets" && matches[2] === "entries") {
			// clear all presets
			dispatch(clearEntities(EntityType.PresetRecord));
		}
	}

	private _processOSCMessage(packet: any): void {
		const paramMatcher = /\/rnbo\/inst\/0\/params\/(\S+)/;
		const address: string = packet.address;

		const matcher = /\/rnbo\/inst\/0\/(params|presets)\/(\S+)/;
		const matches = address.match(matcher);
		if (!matches) return;

		if (matches[1] === "params") {
			const paramPath = matches[2];
			const paramValue = packet.args[0];
			if (paramPath.endsWith("/normalized")) {
				const paramName = paramPath.slice(0, -("/normalized").length);
				dispatch(setParameterValueNormalized(paramName, paramValue));
			} else {
				dispatch(setParameterValue(paramPath, paramValue));
			}
		} else if (matches[1] === "presets" && matches[2] === "entries") {
			dispatch(updatePresets(packet.args));
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
			await this._ws.connect();

			this._ws.on("close", this._onClose);
			this._ws.on("error", this._onError);
			this._ws.on("reconnecting", this._onReconnecting);
			this._ws.on("reconnect", this._onReconnected);
			this._ws.on("reconnect_failed", this._onClose);
			this._ws.on("message", this._onMessage);

			// Update Connection Status
			dispatch(setConnectionStatus(this.readyState));

			// Fetch the instrument description and patchers list
			this._ws.send("/rnbo/patchers");
			this._ws.send("/rnbo/inst/0");
		} catch (err) {
			// Update Connection Status
			dispatch(setConnectionStatus(this.readyState));

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
