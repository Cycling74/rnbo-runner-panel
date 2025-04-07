import { Map as ImmuMap } from "immutable";

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
	AudioOff,
	Closed,
	Error
}

export enum InstanceTab {
	MessagePorts = "msg",
	Parameters = "params",
	DataRefs = "datarefs",
}

export const bodyFontSize = 16;

export const nodeDefaultWidth = 435;
export const nodeHeaderHeight = 50;
export const nodePortSpacing = 30;
export const nodePortHeight = 20;
export const defaultNodeGap = 150;

export const maxEditorZoom = 5;
export const minEditorZoom = 0.25;

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

export enum SortOrder {
	Asc = "asc",
	Desc = "desc"
}

export enum MIDIMappedParameterSortAttr {
	MIDISource = "midi_source",
	InstanceId = "instance_id",
	ParameterName = "param_name"
}

export enum MIDIMetaMappingType {
	ChannelPressure = "channel_pressure",
	ControlChange = "control_change",
	KeyPressure = "key_pressure",
	Note = "note",
	PitchBend = "pitch_bend",
	ProgramChange = "progam_change"
}

export enum ParameterSortAttr {
	Index = "displayorder",
	Name = "name"
}

export enum RunnerCmdMethod {
	ReadFile = "file_read",
	DeleteFile = "file_delete",
	WriteFile = "file_write",
	WriteFileExtended = "file_write_extended"
}

export enum MetadataScope {
	Parameter,
	Inport,
	Outport,
	DataRef
}

export enum KnownPortGroup {
	UserGraphSrc = "rnbo-graph-user-src",
	UserGraphSink = "rnbo-graph-user-sink",
	Hidden = "rnbo-graph-hidden"
}

export const knownPortGroupDisplayNames: ImmuMap<string, string> = ImmuMap({
	[KnownPortGroup.UserGraphSrc]: "System Input",
	[KnownPortGroup.UserGraphSink]: "System Output",
	[KnownPortGroup.Hidden]: "Hidden"
});

export enum RNBOJackPortPropertyKey {
	InstanceId = "rnbo-instance-id",
	Physical = "physical",
	PortGroup = "http://jackaudio.org/metadata/port-group",
	PrettyName = "http://jackaudio.org/metadata/pretty-name",
	Source = "source",
	Terminal = "terminal",
	Type = "type"
}

export const UnsavedSetName = "(untitled)";
