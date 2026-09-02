import { TransportAction, TransportActionType } from "../actions/transport";

export interface TransportState {
	bpm: number;
	rolling: boolean;
	sync: boolean;
	linksync: boolean;
	show: boolean;
	bar_beat: [number, number];
	time_signature: [number, number];
	barBeatAvailable: boolean;
	timeSignatureAvailable: boolean;
}

const transportDefaults = {
	bpm: 100,
	rolling: false,
	sync: true,
	linksync: true,
	bar_beat: [0, 0] as [number, number],
	time_signature: [4, 4] as [number, number],
	barBeatAvailable: false,
	timeSignatureAvailable: false
};

export const transport = (state: TransportState = {
	bpm: transportDefaults.bpm,
	rolling: transportDefaults.rolling,
	sync: transportDefaults.sync,
	linksync: transportDefaults.linksync,
	show: false,
	bar_beat: transportDefaults.bar_beat,
	time_signature: transportDefaults.time_signature,
	barBeatAvailable: transportDefaults.barBeatAvailable,
	timeSignatureAvailable: transportDefaults.timeSignatureAvailable

}, action: TransportAction): TransportState => {

	switch (action.type) {

		case TransportActionType.INIT: {
			const { bpm, rolling, sync, linksync, bar_beat, time_signature, barBeatAvailable, timeSignatureAvailable } = action.payload;

			return {
				...state,
				bpm: bpm || transportDefaults.bpm,
				rolling: rolling === undefined ? transportDefaults.rolling : rolling,
				sync: sync === undefined ? transportDefaults.sync : sync,
				linksync: linksync === undefined ? transportDefaults.linksync : linksync,
				bar_beat: bar_beat || transportDefaults.bar_beat,
				time_signature: time_signature || transportDefaults.time_signature,
				barBeatAvailable: barBeatAvailable === undefined ? transportDefaults.barBeatAvailable : barBeatAvailable,
				timeSignatureAvailable: timeSignatureAvailable === undefined ? transportDefaults.timeSignatureAvailable : timeSignatureAvailable
			};
		}

		case TransportActionType.UPDATE_TRANSPORT: {
			const { bpm, rolling, sync, linksync, bar_beat, time_signature, barBeatAvailable, timeSignatureAvailable } = action.payload;

			return {
				...state,
				bpm: bpm === undefined ? state.bpm : bpm,
				rolling: rolling === undefined ? state.rolling : rolling,
				sync: sync === undefined ? state.sync : sync,
				linksync: linksync === undefined ? state.linksync : linksync,
				bar_beat: bar_beat === undefined ? state.bar_beat : bar_beat,
				time_signature: time_signature === undefined ? state.time_signature : time_signature,
				barBeatAvailable: barBeatAvailable === undefined ? state.barBeatAvailable : barBeatAvailable,
				timeSignatureAvailable: timeSignatureAvailable === undefined ? state.timeSignatureAvailable : timeSignatureAvailable
			};
		}

		case TransportActionType.SET_SHOW_TRANSPORT_CONTROL: {
			const { show } = action.payload;
			return {
				...state,
				show
			};
		}


		default:
			return state;
	}
};
