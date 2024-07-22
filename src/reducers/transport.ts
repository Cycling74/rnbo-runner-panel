import { TransportAction, TransportActionType } from "../actions/transport";

export interface TransportState {
	bpm: number;
	rolling: boolean;
	sync: boolean;
	show: boolean;
}

const transportDefaults = {
	bpm: 100,
	rolling: false,
	sync: true
};

export const transport = (state: TransportState = {
	bpm: transportDefaults.bpm,
	rolling: transportDefaults.rolling,
	sync: transportDefaults.sync,
	show: false

}, action: TransportAction): TransportState => {

	switch (action.type) {

		case TransportActionType.INIT: {
			const { bpm, rolling, sync } = action.payload;

			return {
				...state,
				bpm: bpm || transportDefaults.bpm,
				rolling: rolling || transportDefaults.rolling,
				sync: sync || transportDefaults.sync
			};
		}

		case TransportActionType.UPDATE_TRANSPORT: {
			const { bpm, rolling, sync } = action.payload;

			return {
				...state,
				bpm: bpm === undefined ? state.bpm : bpm,
				rolling: rolling === undefined ? state.rolling : rolling,
				sync: sync === undefined ? state.sync : sync
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
