import { NetworkAction, NetworkActionType } from "../actions/network";
import { WebSocketState } from "../lib/constants";


export interface NetworkState {
	connectionStatus: WebSocketState;
	connectionError: Error | undefined;
}

export const network = (state: NetworkState = {

	connectionStatus: WebSocketState.CONNECTING,
	connectionError: undefined

}, action: NetworkAction) => {

	switch (action.type) {

		case NetworkActionType.SET_CONNECTION_STATUS: {
			const { status, error } = action.payload;
			return {
				...state,
				connectionStatus: status,
				error: error || undefined
			};
		}

		default:
			return state;
	}
};
