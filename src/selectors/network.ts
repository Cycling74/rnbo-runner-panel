import { WebSocketState } from "../lib/constants";
import { RootStateType } from "../lib/store";

export const getConnectionStatus = (state: RootStateType): WebSocketState => state.network.connectionStatus;
export const getConnectionError = (state: RootStateType): Error | undefined => state.network.connectionError;
