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

export enum InstanceTab {
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

export enum SettingTarget {
	App,
	Runner
}

export enum SettingsTab {
	UI = "ui",
	Control = "control",
	Instance = "instance",
	Audio = "audio"
}

export enum Orientation {
	Horizontal = "horizontal",
	Vertical = "vertical"
}

export enum BPMRange {
	Min = 1,
	Max = 2000
}

export const DEFAULT_MIDI_RANGE = ["none", "omni", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
export const DEFAULT_SAMPLE_RATES = [22500, 44100, 48000];
