import { writePacket } from "osc";
import { ActionBase, AppThunk } from "../lib/store";
import { NotificationLevel } from "../models/notification";
import { getIsStreamRecording } from "../selectors/recording";
import { showNotification } from "./notifications";
import { OSCQueryRNBOJackRecord, OSCQueryValueType } from "../lib/types";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";

export enum StreamRecordingActionType {
	INIT = "INIT_STREAM_RECORDING",

	SET_ACTIVE = "SET_STREAM_RECORDING_ACTIVE",
	SET_CAPTURED = "SET_STREAM_RECORDING_CAPTURED_TIME"
}

export interface IInitStreamRecording extends ActionBase {
	type: StreamRecordingActionType.INIT;
	payload: {
		active: boolean;
		capturedTime: number;
	};
}

export interface ISetStreamRecordingActive extends ActionBase {
	type: StreamRecordingActionType.SET_ACTIVE;
	payload: {
		active: boolean;
	};
}

export interface ISetStreamRecordingCapturedTime extends ActionBase {
	type: StreamRecordingActionType.SET_CAPTURED;
	payload: {
		capturedTime: number;
	};
}

export type StreamRecordingAction = IInitStreamRecording | ISetStreamRecordingActive | ISetStreamRecordingCapturedTime;

export const initStreamRecording = (state?: OSCQueryRNBOJackRecord): IInitStreamRecording => {
	return {
		type: StreamRecordingActionType.INIT,
		payload: {
			active: state?.CONTENTS?.active?.TYPE === OSCQueryValueType.True,
			capturedTime: state?.CONTENTS?.captured?.VALUE || 0
		}
	};
};

export const toggleStreamRecording = () : AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const isActive = getIsStreamRecording(state);
			const message = {
				address: "/rnbo/jack/record/active",
				args: [
					isActive
						? { type: OSCQueryValueType.False, value: "false" }
						: { type: OSCQueryValueType.True, value: "true" }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to change recording state",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

// Updates from Runner
export const updateStreamRecordingActiveState = (active: boolean): ISetStreamRecordingActive => {
	return {
		type: StreamRecordingActionType.SET_ACTIVE,
		payload: { active }
	};
};

export const updateStreamRecordingCapturedTime = (capturedTime: number): ISetStreamRecordingCapturedTime => {
	return {
		type: StreamRecordingActionType.SET_CAPTURED,
		payload: { capturedTime }
	};
};
