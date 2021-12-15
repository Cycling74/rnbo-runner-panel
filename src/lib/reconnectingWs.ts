import EventEmitter from "events";
import { WebSocketState } from "./constants";
import { sleep } from "./util";

export class ReconnectingWebsocket extends EventEmitter {

	private _ws: WebSocket | null = null;

	private readonly _hostname: string;
	private readonly _port: string;

	private retryCount: number = 1;
	private doReconnect: boolean = true;
	private connecting: boolean = false;

	public readonly maxRetries: number;
	public readonly retryTimeout: number;

	constructor({
		hostname,
		port,
		maxRetries = 10,
		retryTimeout = 500
	}: {
		hostname: string;
		port: string;
		maxRetries?: number;
		retryTimeout?: number;
	}) {
		super();

		this._hostname = hostname;
		this._port = port;

		this.maxRetries = maxRetries;
		this.retryTimeout = retryTimeout;
	}

	private _onClose = async (evt: CloseEvent): Promise<void> => {
		if (!this.doReconnect) return void this.emit("close", evt);

		this.emit("reconnecting");
		try {
			await this.attemptConnect();
			this.emit("reconnect");
		} catch (err) {
			this.emit("reconnect_failed", err);
		}
	};

	private _onError = async (evt: ErrorEvent): Promise<void> => {
		if (!this.doReconnect) return void this.emit("error", evt);

		this.emit("reconnecting");
		try {
			await this.attemptConnect();
			this.emit("reconnect");
		} catch (err) {
			this.emit("reconnect_failed", err);
		}
	};

	private _onMessage = (evt: MessageEvent) => {
		this.emit("message", evt);
	}

	private async attemptConnect(): Promise<void> {
		this.connecting = true;
		this.retryCount = 1;

		if (this._ws) {
			this._ws.removeEventListener("close", this._onClose);
			this._ws.removeEventListener("error", this._onError);
			this._ws.removeEventListener("message", this._onMessage);
			this._ws = null;
		}

		while (this.maxRetries && this.retryCount <= this.maxRetries) {

			try {
				const ws = await this.doConnect();

				ws.addEventListener("close", this._onClose);
				ws.addEventListener("error", this._onError);
				ws.addEventListener("message", this._onMessage);

				this._ws = ws;
				break;

			} catch (err) {
				if (this.retryCount === this.maxRetries) throw err;
				this.retryCount += 1;
				await sleep(this.retryTimeout);
			} finally {
				this.connecting = false;
			}

		}
	}

	private doConnect(): Promise<WebSocket> {
		return new Promise<WebSocket>((resolve, reject) => {
			const ws = new WebSocket(`ws://${this.hostname}:${this.port}`);
			let onError: (evt: ErrorEvent) => void = undefined;

			const onOpen = (evt: Event): void => {

				// Remove connection establishing handlers
				ws.removeEventListener("open", onOpen);
				ws.removeEventListener("error", onError);

				resolve(ws);
			};

			onError = (evt: ErrorEvent): void => {
				ws.removeEventListener("open", onOpen);
				ws.removeEventListener("error", onError);

				reject(evt);
			};

			ws.addEventListener("open", onOpen);
			ws.addEventListener("error", onError);
		});
	}

	public get hostname(): string {
		return this._hostname;
	}

	public get port(): string {
		return this._port;
	}

	public get readyState(): WebSocketState {
		return this.connecting ? WebSocketState.CONNECTING : this._ws?.readyState || WebSocketState.CLOSED;
	}

	public async connect() {
		await this.attemptConnect();
	}

	public close(): void {
		this.doReconnect = false;
		this._ws?.close();
	}

	public send(msg: string) {
		if (this.readyState === WebSocketState.OPEN) {
			this._ws?.send(msg);
		}
	}

	public sendPacket(packet: any): void {
		if (this.readyState === WebSocketState.OPEN) {
			this._ws?.send(Buffer.from(packet));
		}
	}
}
