import { parse as parseQuery } from "querystring";
import { EventEmitter } from "events";

export class OSCQueryBridgeController extends EventEmitter {
	private _ws: WebSocket;
	constructor() {
		super();

		let { h, p } = parseQuery(location.search?.slice(1));
		if (!p || process.env.NODE_ENV === "development") p = "5678";
		if (!h) h = location.hostname;
		const wsurl = `ws://${h}:${p}`;

		const ws = new WebSocket(wsurl);

		ws.addEventListener("open", () => {
			this.emit("open");

			// Fetch the instrument description
			ws.send("/rnbo/inst/0");
		});

		ws.addEventListener("close", () => {
			this.emit("close");
		});

		ws.addEventListener("error", (e) => {
			this.emit("error", e);
		})

		ws.addEventListener("message", (m) => {
			this.emit("message", m);
		});

		this._ws = ws;
	}

	get readyState() {
		return this._ws.readyState;
	}

	get ws() {
		return this._ws;
	}
}
