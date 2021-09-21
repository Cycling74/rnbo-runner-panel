import { NetworkAction, NetworkActionType, ConnectionStatus } from "../actions/network";
import { WebSocketState } from "../lib/constants";


export interface NetworkState {
	connectionStatus: ConnectionStatus;
	connectionError: Error | undefined;
}

export const network = (state: NetworkState = {

	connectionStatus: WebSocketState.CLOSED | WebSocketState.OPEN | WebSocketState.CONNECTING | WebSocketState.CLOSING,
	connectionError: undefined

}, action: NetworkAction) => {

	switch (action.type) {

		case NetworkActionType.SET_CONNECTION_STATUS: {
			const { status, error } = action.payload;
			return {
				...state,
				connectionStatus: status,
				error: error || undefined
			};
		}

		default:
			return state;
	}
};
