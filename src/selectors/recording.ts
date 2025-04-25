import { Duration } from "dayjs/plugin/duration";
import { RootStateType } from "../lib/store";
import { StreamRecordingState } from "../reducers/recording";

export const getStreamRecordingState = (state: RootStateType): StreamRecordingState => ({
	active: state.recording.active,
	capturedTime: state.recording.capturedTime
});

export const getIsStreamRecording = (state: RootStateType): boolean => {
	return state.recording.active;
};

export const getStreamRecordingCapturedTime = (state: RootStateType): Duration => {
	return state.recording.capturedTime;
};
