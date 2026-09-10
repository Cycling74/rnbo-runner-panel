import EventEmitter from "events";
import { WebSocketState } from "./constants";

export class ReconnectingWebsocket extends EventEmitter {

	private _ws: WebSocket | null = null;

	private readonly _hostname: string;
	private readonly _port: string;

	private retryCount: number = 1;
	private doReconnect: boolean = true;
	private connecting: boolean = false;

	// Resolves the backoff currently being waited out, if any.
	private wakeUp: (() => void) | null = null;

	public readonly maxRetries: number;
	public readonly maxReconnectRetries: number;
	public readonly retryTimeout: number;
	public readonly maxRetryTimeout: number;

	constructor({
		hostname,
		port,
		maxRetries = 10,
		maxReconnectRetries = Infinity,
		retryTimeout = 500,
		maxRetryTimeout = 30000
	}: {
		hostname: string;
		port: string;
		// Attempts allowed for the initial connect. Bounded, so an endpoint that
		// simply isn't there (a typo'd ?h= host) still surfaces as an error
		// rather than spinning forever.
		maxRetries?: number;
		// Attempts allowed after a connection has been established. Unbounded:
		// the runner can be gone for minutes at a time (an ethernet link that
		// drops, a Pi rebooting) and it always comes back, so giving up strands
		// the UI until the user reloads by hand.
		maxReconnectRetries?: number;
		retryTimeout?: number;
		maxRetryTimeout?: number;
	}) {
		super();

		this._hostname = hostname;
		this._port = port;

		this.maxRetries = maxRetries;
		this.maxReconnectRetries = maxReconnectRetries;
		this.retryTimeout = retryTimeout;
		this.maxRetryTimeout = maxRetryTimeout;
	}

	private _onClose = async (evt: CloseEvent): Promise<void> => {
		if (!this.doReconnect) return void this.emit("close", evt);

		this.emit("reconnecting");
		try {
			await this.attemptConnect(this.maxReconnectRetries);
			this.emit("reconnect");
		} catch (err) {
			this.emit("reconnect_failed", err);
		}
	};

	private _onError = async (evt: ErrorEvent): Promise<void> => {
		if (!this.doReconnect) return void this.emit("error", evt);

		this.emit("reconnecting");
		try {
			await this.attemptConnect(this.maxReconnectRetries);
			this.emit("reconnect");
		} catch (err) {
			this.emit("reconnect_failed", err);
		}
	};

	private _onMessage = (evt: MessageEvent) => {
		this.emit("message", evt);
	};

	// Exponential, capped: 500ms, 1s, 2s, 4s ... 30s. Retrying every 500ms for
	// the whole of a multi-minute outage is just noise, but the ceiling has to
	// stay low enough that we come back promptly once the runner does.
	private backoff(): number {
		return Math.min(this.retryTimeout * Math.pow(2, this.retryCount - 1), this.maxRetryTimeout);
	}

	// Wait out the backoff, but cut it short when the browser tells us something
	// changed: the machine came back online, or the user returned to the tab.
	// Without this, coming back to a tab that is 30s into a wait means sitting
	// through the remainder before anything is even attempted.
	private wait(ms: number): Promise<void> {
		return new Promise<void>(resolve => {
			// Aborting detaches both listeners at once, which keeps `finish` from
			// having to name handlers that are declared after it.
			const controller = new AbortController();
			const { signal } = controller;

			const finish = (): void => {
				controller.abort();
				this.wakeUp = null;
				resolve();
			};

			const timeout = setTimeout(finish, ms);
			signal.addEventListener("abort", () => clearTimeout(timeout));

			window.addEventListener("online", finish, { signal });
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") finish();
			}, { signal });

			this.wakeUp = finish;
		});
	}

	private async attemptConnect(maxRetries: number): Promise<void> {
		this.connecting = true;
		this.retryCount = 1;

		if (this._ws) {
			this._ws.removeEventListener("close", this._onClose);
			this._ws.removeEventListener("error", this._onError);
			this._ws.removeEventListener("message", this._onMessage);
			this._ws = null;
		}

		try {
			while (this.doReconnect && this.retryCount <= maxRetries) {

				try {
					const ws = await this.doConnect();

					ws.addEventListener("close", this._onClose);
					ws.addEventListener("error", this._onError);
					ws.addEventListener("message", this._onMessage);

					this._ws = ws;
					return;

				} catch (err) {
					if (this.retryCount >= maxRetries) throw err;
					const delay = this.backoff();
					this.retryCount += 1;
					await this.wait(delay);
				}

			}

			// Only reached when close() was called mid-backoff, or when the
			// caller asked for no attempts at all.
			throw new Error("The connection to the RNBO Runner was not established");
		} finally {
			this.connecting = false;
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
		await this.attemptConnect(this.maxRetries);
	}

	public close(): void {
		this.doReconnect = false;
		// Break out of a backoff we may be sitting in, so the retry loop exits
		// now rather than up to maxRetryTimeout from now.
		this.wakeUp?.();
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
