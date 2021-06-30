import { NetworkAction, NetworkActionType, ConnectionStatus } from "../actions/network";


export interface NetworkState {
	connectionStatus: ConnectionStatus;
	connectionError: Error | undefined;
}

export const network = (state: NetworkState = {

	connectionStatus: WebSocket.CLOSED | WebSocket.OPEN | WebSocket.CONNECTING | WebSocket.CLOSING,
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
