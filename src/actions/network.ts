import { ActionBase } from "../lib/store";

export type ConnectionStatus = WebSocket["CLOSED"] | WebSocket["CLOSING"] | WebSocket["CONNECTING"] | WebSocket["OPEN"];

export enum NetworkActionType {
	SET_CONNECTION_STATUS = "SET_CONNECTION_STATUS",
};

export interface ISetConnectionStatus extends ActionBase {
	type: NetworkActionType.SET_CONNECTION_STATUS;
	payload: {
		error?: Error | undefined;
		status: ConnectionStatus;
	};
};

export type NetworkAction = ISetConnectionStatus;

export const setConnectionStatus = (status: ConnectionStatus, error?: Error): NetworkAction => {
	return {
		type: NetworkActionType.SET_CONNECTION_STATUS,
		payload: {
			error,
			status
		}
	};
};
