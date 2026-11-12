import { RootStateType } from "../lib/store";

export const getShowTransportControl = (state: RootStateType): boolean => state.transport.show;

export const getTransportControlState = (state: RootStateType): Pick<RootStateType["transport"], "bpm" | "rolling" | "sync" | "linkSync" | "bar_beat" | "time_signature" | "barBeatAvailable" | "timeSignatureAvailable"> => ({
	bpm: state.transport.bpm,
	rolling: state.transport.rolling,
	sync: state.transport.sync,
	linkSync: state.transport.linkSync,
	bar_beat: state.transport.bar_beat,
	time_signature: state.transport.time_signature,
	barBeatAvailable: state.transport.barBeatAvailable,
	timeSignatureAvailable: state.transport.timeSignatureAvailable
});

export const getTransportLinkSync = (state: RootStateType): boolean => state.transport.linkSync;
