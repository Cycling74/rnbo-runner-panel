import { parse as parseQuery } from "querystring";
import { readPacket } from "osc";
import { initializeDevice, setParameterValue } from "../actions/device";
import { deleteEntity, setEntity } from "../actions/entities";
import { setConnectionStatus } from "../actions/network";
import { AppDispatch, store } from "../lib/store";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { EntityType } from "../reducers/entities";
import { WebSocketState } from "../lib/constants";

const dispatch = store.dispatch as AppDispatch;
export class OSCQueryBridgeControllerPrivate {

	private _hostname = "localhost";
	private _port = "5678";
	private _ws: WebSocket | undefined;

	private _onClose = (evt: ErrorEvent) => {
		dispatch(setConnectionStatus(this.readyState));
	};

	private _onError = (evt: ErrorEvent) => {
		dispatch(setConnectionStatus(this.readyState));
	};

	private _onMessage = async (evt: MessageEvent): Promise<void> => {
		try {
			if (typeof evt.data === "string") {

				const data = JSON.parse(evt.data);
				// console.log(data);
				if (typeof data.FULL_PATH === "string" && data.FULL_PATH === "/rnbo/inst/0" && (typeof data.CONTENTS !== "undefined")) {

					// brand new device
					// need to add presets in this func
					dispatch(initializeDevice(data));

				} else if (typeof data.FULL_PATH === "string" && data.FULL_PATH.startsWith("/rnbo/inst/0/params")) {

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
				} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_ADDED") {
					this._onPathAdded(data.DATA);
				} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_REMOVED") {
					this._onPathRemoved(data.DATA);
				} else {
					// unhandled message
					// console.log("unhandled");
					// console.log(data);
				}
			} else {
				const buf = await evt.data.arrayBuffer();
				const message = readPacket(buf, {});
				this._processOSCMessage(message);
			}
		} catch (e) {
			console.error(e);
		}
	}

	private _onPathAdded(path: string): void {
		const matcher = /\/rnbo\/inst\/0\/(params|messages\/in|presets)\/(\S+)/;
		const matches = path.match(matcher);
		if (!matches) return;

		// Fetch new parameters
		if (matches[1] === "params" && !matches[2].endsWith("/normalized")) {
			this._ws.send(path);
		} else if (matches[1] === "messages/in") {
			// Inports can be declared with just a name
			dispatch(setEntity(EntityType.InportRecord, new InportRecord({ name: matches[2] })));
		} else if (matches[1] === "presets/entries") {
			console.log(path);
			// fetch new preset?
			this._ws.send(path);
			// dispatch(setEntity(EntityType.PresetRecord, new PresetRecord({ name: matches })));
			// eventually need to set PresetRecord once I can figure out what to put in it!
		}
	}

	private _onPathRemoved(path: string): void {
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
		} else if (matches[1] === "presets") {
			const prePath = matches[2];
			dispatch(deleteEntity(EntityType.PresetRecord, prePath));
			// dispatch delete
			// console.log(matches);
		}
	}

	private _processOSCMessage(packet: any): void {
			const matcher = /\/rnbo\/inst\/0\/(params|presets\/entries)\/(\S+)/;
			const address: string = packet.address;

			const matches = address.match(matcher);
			if (!matches) return;

			if (matches[1] === "params") {
				const paramValue = packet.args[0];
				const paramPath = matches[1];
				let normalized = false;
				let paramName  = paramPath;
				if (paramPath.endsWith("/normalized")) {
					paramName = paramPath.slice(0, -("/normalized").length);
					normalized = true;
				}
				dispatch(setParameterValue(paramName, paramValue, normalized));
			} else if (matches[1] === "presets/entries" && packet.args) {
				// for each name in array
				// dispatch(setPresetValue(name));
			}
	}

	public get hostname(): string {
		return this._hostname;
	};

	public get port(): string {
		return this._port;
	};

	public get readyState(): WebSocket["readyState"] {
		return this._ws?.readyState || WebSocket.CONNECTING;
	};

	public get ws(): WebSocket | undefined {
		return this._ws;
	};

	public async connect({ hostname, port }: { hostname: string; port: string; }): Promise<void> {
		return new Promise((resolve, reject) => {
			this._hostname = hostname;
			this._port = port;

			this._ws = new WebSocket(`ws://${this.hostname}:${this.port}`);

			let onError: (evt: ErrorEvent) => void = undefined;

			const onOpen = (evt: Event): void => {

				// Remove connection establishing handlers
				this._ws.removeEventListener("open", onOpen);
				this._ws.removeEventListener("error", onError);

				// Add Event handlers
				this._ws.addEventListener("close", this._onClose);
				this._ws.addEventListener("error", this._onError);
				this._ws.addEventListener("message", this._onMessage);

				// Update Connection Status
				dispatch(setConnectionStatus(this.readyState));

				// Fetch the instrument description
				this._ws.send("/rnbo/inst/0");

				resolve();
			};

			onError = (evt: ErrorEvent): void => {
				this._ws.removeEventListener("open", onOpen);
				this._ws.removeEventListener("error", onError);

				dispatch(setConnectionStatus(this.readyState));
			};

			this._ws.addEventListener("open", onOpen);
			this._ws.addEventListener("error", onError);
		});
	}

	public close(): void {
		this._ws?.close();
	}

	public sendPacket(packet: any): void {
		if (this.readyState === WebSocketState.OPEN) {
			this._ws.send(Buffer.from(packet));
		}
	}
}

export const parseConnectionQueryString = (qs: string): { hostname: string; port: string; } => {
	const { h, p } = parseQuery(qs);
	return {
		hostname: !h ? location.hostname : Array.isArray(h) ? h[0] : h,
		port: !p || process.env.NODE_ENV === "development" ? "5678" : Array.isArray(p) ? p[0] : p
	};
};

// Singleton instance of a private class! we only export the type here.
export type OSCQueryBridgeController = InstanceType<typeof OSCQueryBridgeControllerPrivate>;
export const oscQueryBridge: OSCQueryBridgeController = new OSCQueryBridgeControllerPrivate() as OSCQueryBridgeController;
