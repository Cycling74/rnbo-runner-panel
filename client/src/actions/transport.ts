import { writePacket } from "osc/dist/osc-browser";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOJackTransport, OSCQueryValueType } from "../lib/types";
import { getShowTransportControl, getTransportControlState } from "../selectors/transport";
import { clamp } from "../lib/util";
import { BPMRange, TimeSignatureRange } from "../lib/constants";

export type PartialTransportStatus = Partial<{ bpm: number; rolling: boolean; sync: boolean; linksync: boolean; bar_beat: [number, number]; time_signature: [number, number]; barBeatAvailable: boolean; timeSignatureAvailable: boolean }>;

export enum TransportActionType {
	INIT = "INIT_TRANSPORT",
	SET_SHOW_TRANSPORT_CONTROL = "SET_SHOW_TRANSPORT_CONTROL",
	UPDATE_TRANSPORT = "UPDATE_TRANSPORT"
}

export interface IInitTransport extends ActionBase {
	type: TransportActionType.INIT;
	payload: PartialTransportStatus;
}

export interface ISetShowTransportControl extends ActionBase {
	type: TransportActionType.SET_SHOW_TRANSPORT_CONTROL;
	payload: {
		show: boolean;
	};
}

export interface IUpdateTransport extends ActionBase {
	type: TransportActionType.UPDATE_TRANSPORT,
	payload: PartialTransportStatus;
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

export const initTransport = (info?: OSCQueryRNBOJackTransport): IInitTransport => {
	return {
		type: TransportActionType.INIT,
		payload: {
			bpm: info?.CONTENTS?.bpm?.VALUE,
			rolling: info?.CONTENTS?.rolling?.TYPE === OSCQueryValueType.True || false,
			sync: info?.CONTENTS?.sync?.TYPE === OSCQueryValueType.True || false,
			linksync: info?.CONTENTS?.linksync?.TYPE === OSCQueryValueType.True || false,
			bar_beat: info?.CONTENTS?.bar_beat?.VALUE || [0, 0],
			time_signature: info?.CONTENTS?.time_sig?.VALUE || [4, 4],
			// Capability gates, same node-presence trick the bridge already uses for is_active.
			// An older runner has neither node, so the controls stay hidden rather than being
			// offered inert: setting one would post to an address nothing is listening on.
			barBeatAvailable: info?.CONTENTS?.bar_beat !== undefined,
			// Node present but the runner reporting false means a jack_transport_link too old to
			// understand /jacklink/timesig. A runner with time_sig but no availability node at all
			// predates the gate and always supported it, hence the !== False rather than === True.
			timeSignatureAvailable: info?.CONTENTS?.time_sig !== undefined
				&& info?.CONTENTS?.time_sig_available?.TYPE !== OSCQueryValueType.False
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

export const resetTransportPositionOnRemote = (): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/position`,
			args: [{
				value: 0.0,
				type: OSCQueryValueType.Float32
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

export const setTransportLinkSyncOnRemote = (linksync: boolean): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/linksync`,
			args: [{
				value: linksync ? "true" : "false",
				type: linksync ? OSCQueryValueType.True : OSCQueryValueType.False
			}]
		}));
	};

export const toggleTransportLinkSyncOnRemote = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		dispatch(setTransportLinkSyncOnRemote(!getTransportControlState(state).linksync));
	};


export const setTransportBPMOnRemote = (bpm: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/bpm`,
			args: [{
				value: clamp(bpm, BPMRange.Min, BPMRange.Max),
				type: OSCQueryValueType.Float32
			}]
		}));
	};

export const setTransportTimeSignatureOnRemote = (beatsPerBar: number, beatType: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscTransportPathPrefix}/time_sig`,
			args: [
				{
					value: clamp(beatsPerBar, TimeSignatureRange.Min, TimeSignatureRange.Max),
					type: OSCQueryValueType.Int32
				},
				{
					value: beatType,
					type: OSCQueryValueType.Int32
				}
			]
		}));
	};

export const incrementTransportBPMOnRemote = (scale: number = 1): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const bpm = clamp(getTransportControlState(state).bpm + (1 * scale), BPMRange.Min, BPMRange.Max);
		dispatch(setTransportBPMOnRemote(bpm));
	};

export const decrementTransportBPMOnRemote = (scale: number = 1): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const bpm = clamp(getTransportControlState(state).bpm - (1 * scale), BPMRange.Min, BPMRange.Max);
		dispatch(setTransportBPMOnRemote(bpm));
	};

export const updateTransportStatus = (status: PartialTransportStatus): TransportAction => {
	return {
		type: TransportActionType.UPDATE_TRANSPORT,
		payload: status
	};
};
