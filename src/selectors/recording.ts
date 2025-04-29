import { Duration } from "dayjs/plugin/duration";
import { RootStateType } from "../lib/store";
import { StreamRecordingState } from "../reducers/recording";
import { createSelector } from "reselect";
import { getRunnerConfig } from "./settings";
import { ConfigKey, ConfigRecord } from "../models/config";
import { dayjs } from "../lib/util";

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

export const getStreamRecordingTimeout = createSelector(
	[
		(state: RootStateType): ConfigRecord => getRunnerConfig(state, ConfigKey.RecordingTimeout)
	],
	(config): Duration | null => {
		const val = config?.value || 0;

		if (typeof val !== "number") return null;
		if (val <= 0) return null;

		return dayjs.duration(val, "seconds");
	}
);
