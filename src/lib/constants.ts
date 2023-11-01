export enum WebSocketState {
	CONNECTING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3
}

export enum AppStatus {
	Connecting,
	InitializingState,
	Ready,
	Reconnecting,
	ResyncingState,
	Closed,
	Error
}

export enum DeviceTab {
	MessagePorts = "msg",
	MIDI = "midi",
	Parameters = "params"
}

export const bodyFontSize = 16;

export enum Breakpoints {
	xs = 36 * 16,
	sm = 48 * 16,
	md = 62 * 16,
	lg = 75 * 16,
	xl = 88 * 16
}
