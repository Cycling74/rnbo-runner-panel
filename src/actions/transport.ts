import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOJackTransport, OSCQueryValueType } from "../lib/types";
import { getShowTransportControl, getTransportControlState } from "../selectors/transport";
import { clamp } from "../lib/util";

export enum TransportActionType {
	INIT = "INIT_TRANSPORT",
	SET_SHOW_TRANSPORT_CONTROL = "SET_SHOW_TRANSPORT_CONTROL",
	UPDATE_TRANSPORT = "UPDATE_TRANSPORT"
}

export interface IInitTransport extends ActionBase {
	type: TransportActionType.INIT;
	payload: {
		bpm: number;
		rolling: boolean;
		sync: boolean;
	};
}

export interface ISetShowTransportControl extends ActionBase {
	type: TransportActionType.SET_SHOW_TRANSPORT_CONTROL;
	payload: {
		show: boolean;
	};
}

export interface IUpdateTransport extends ActionBase {
	type: TransportActionType.UPDATE_TRANSPORT,
	payload: Partial<IInitTransport["payload"]>;
}

export type TransportAction = IInitTransport | ISetShowTransportControl | IUpdateTransport;


export const showTransportControl = (): TransportAction => {
	return {
		type: TransportActionType.SET_SHOW_TRANSPORT_CONTROL,
		payload: {
			show: true
		}
	};
};

export const hideTransportControl = (): TransportAction => {
	return {
		type: TransportActionType.SET_SHOW_TRANSPORT_CONTROL,
		payload: {
			show: false
		}
	};
};

export const toggleTransportControl = () : AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const isShown = getShowTransportControl(state);
		dispatch({ type: TransportActionType.SET_SHOW_TRANSPORT_CONTROL, payload: { show: !isShown } });
	};

export const initTransport = (info: OSCQueryRNBOJackTransport) => {
	return {
		type: TransportActionType.INIT,
		payload: {
			bpm: info.CONTENTS?.bpm?.VALUE || 100,
			rolling: info.CONTENTS?.rolling?.TYPE === OSCQueryValueType.True || false,
			sync: info.CONTENTS?.sync?.TYPE === OSCQueryValueType.True || false
		}
	};
};

const oscTransportPathPrefix = "/rnbo/jack/transport";

export const setTransportRollingOnRemote = (roll: boolean): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/rolling`,
			args: [{
				value: roll ? "true" : "false",
				type: roll ? OSCQueryValueType.True : OSCQueryValueType.False
			}]
		}));
	};

export const toggleTransportRollingOnRemote = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		dispatch(setTransportRollingOnRemote(!getTransportControlState(state).rolling));
	};

export const setTransportSyncOnRemote = (sync: boolean): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/sync`,
			args: [{
				value: sync ? "true" : "false",
				type: sync ? OSCQueryValueType.True : OSCQueryValueType.False
			}]
		}));
	};

export const toggleTransportSyncOnRemote = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		dispatch(setTransportSyncOnRemote(!getTransportControlState(state).sync));
	};


export const setTransportBPMOnRemote = (bpm: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/bpm`,
			args: [{
				value: bpm,
				type: OSCQueryValueType.Float32
			}]
		}));
	};

export const incrementTransportBPMOnRemote = (scale: number = 1): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const bpm = clamp(getTransportControlState(state).bpm + (1 * scale), 1, 2000);
		dispatch(setTransportBPMOnRemote(bpm));
	};

export const decrementTransportBPMOnRemote = (scale: number = 1): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const bpm = clamp(getTransportControlState(state).bpm - (1 * scale), 1, 2000);
		dispatch(setTransportBPMOnRemote(bpm));
	};

export const updateTransportStatus = (status: Partial<{ bpm: number; rolling: boolean; sync: boolean; }>): TransportAction => {
	return {
		type: TransportActionType.UPDATE_TRANSPORT,
		payload: status
	};
};
