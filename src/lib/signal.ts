import EventEmitter from "events";

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventCallback<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
	on<K extends EventKey<T>>(eventName: K, fn: EventCallback<T[K]>): void;
	off<K extends EventKey<T>>(eventName: K, fn: EventCallback<T[K]>): void;
	emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export class SignalEmitter<T extends EventMap> implements Emitter<T> {

	private emitter = new EventEmitter();

	once<K extends EventKey<T>>(eventName: K, fn: EventCallback<T[K]>) {
		this.emitter.once(eventName, fn);
	}

	on<K extends EventKey<T>>(eventName: K, fn: EventCallback<T[K]>) {
		this.emitter.on(eventName, fn);
	}

	off<K extends EventKey<T>>(eventName: K, fn: EventCallback<T[K]>) {
		this.emitter.off(eventName, fn);
	}

	emit<K extends EventKey<T>>(eventName: K, params?: T[K]) {
		this.emitter.emit(eventName, params);
	}
}

export enum EditorSignal {
	fitView = "fitview"
}

export const editorSignals = new SignalEmitter<{ [EditorSignal.fitView]: void }>();
