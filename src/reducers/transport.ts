import { TransportAction, TransportActionType } from "../actions/transport";

export interface TransportState {
	bpm: number;
	rolling: boolean;
	sync: boolean;
	show: boolean;
}

export const transport = (state: TransportState = {
	bpm: 100,
	rolling: false,
	sync: true,
	show: false

}, action: TransportAction): TransportState => {

	switch (action.type) {

		case TransportActionType.INIT: {
			const { bpm, rolling, sync } = action.payload;

			return {
				...state,
				bpm,
				rolling,
				sync
			};
		}

		case TransportActionType.UPDATE_TRANSPORT: {
			return {
				...state,
				...action.payload
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
