import { ConnectionStatus } from "../actions/network";
import { RootStateType } from "../lib/store";

export const getConnectionStatus = (state: RootStateType): ConnectionStatus => state.network.connectionStatus;
export const getConnectionError = (state: RootStateType): Error | undefined => state.network.connectionError;
