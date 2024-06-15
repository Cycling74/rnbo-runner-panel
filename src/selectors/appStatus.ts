import { AppStatus } from "../lib/constants";
import { RootStateType } from "../lib/store";
import { RunnerInfoKey, RunnerInfoRecord } from "../models/runnerInfo";

export const getAppStatus = (state: RootStateType): AppStatus => state.appStatus.status;
export const getAppStatusError = (state: RootStateType): Error | undefined => state.appStatus.error;

export const getShowEndpointInfoModal = (state: RootStateType): boolean => state.appStatus.showEndpointInfo;
export const getRunnerEndpoint = (state: RootStateType): { hostname: string; port: string; } => state.appStatus.endpoint;

export const getRunnerInfoRecord = (state: RootStateType, key: RunnerInfoKey): RunnerInfoRecord => state.appStatus.runnerInfo.get(key);
