import { WebSocketState } from "../lib/constants";
import { ActionBase } from "../lib/store";

export enum NetworkActionType {
	SET_CONNECTION_STATUS = "SET_CONNECTION_STATUS",
}

export interface ISetConnectionStatus extends ActionBase {
	type: NetworkActionType.SET_CONNECTION_STATUS;
	payload: {
		error?: Error | undefined;
		status: WebSocketState;
	};
};

export type NetworkAction = ISetConnectionStatus;

export const setConnectionStatus = (status: WebSocketState, error?: Error): NetworkAction => {
	return {
		type: NetworkActionType.SET_CONNECTION_STATUS,
		payload: {
			error,
			status
		}
	};
};
