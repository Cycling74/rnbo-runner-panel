import { RootStateType } from "../lib/store";

export const getShowTransportControl = (state: RootStateType): boolean => state.transport.show;

export const getTransportControlState = (state: RootStateType): Pick<RootStateType["transport"], "bpm" | "rolling" | "sync"> => ({
	bpm: state.transport.bpm,
	rolling: state.transport.rolling,
	sync: state.transport.sync
});
