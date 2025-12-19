import { StreamRecordingAction, StreamRecordingActionType } from "../actions/recording";
import { dayjs } from "../lib/util";
import { Duration } from "dayjs/plugin/duration";

export type StreamRecordingState = {
	active: boolean;
	capturedTime: Duration;
};

export const recording = (state: StreamRecordingState = {
	active: false,
	capturedTime: dayjs.duration(0, "seconds")
}, action: StreamRecordingAction): StreamRecordingState => {

	switch (action.type) {
		case StreamRecordingActionType.INIT: {
			const { active, capturedTime } = action.payload;
			return {
				...state,
				active,
				capturedTime: dayjs.duration(capturedTime, "seconds")
			};
		}

		case StreamRecordingActionType.SET_ACTIVE: {
			const { active } = action.payload;
			return {
				...state,
				active
			};
		}

		case StreamRecordingActionType.SET_CAPTURED: {
			const { capturedTime } = action.payload;
			return {
				...state,
				capturedTime: dayjs.duration(capturedTime, "seconds")
			};
		}

		default:
			return state;
	}
};
