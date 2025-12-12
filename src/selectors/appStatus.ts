import { Map as ImmuMap } from "immutable";
import { createSelector } from "reselect";
import { AppStatus } from "../lib/constants";
import { RootStateType } from "../lib/store";
import { RunnerInfoRecord } from "../models/runnerInfo";
import { RunnerInfoKey } from "../lib/types";


export const getAppStatus = (state: RootStateType): AppStatus => state.appStatus.status;
export const getAppStatusError = (state: RootStateType): Error | undefined => state.appStatus.error;

export const getShowEndpointInfoModal = (state: RootStateType): boolean => state.appStatus.showEndpointInfo;
export const getRunnerEndpoint = (state: RootStateType): { hostname: string; port: string; }  => state.appStatus.endpoint;
export const getRunnerOrigin = (state: RootStateType): string => {
	const endpoint = state.appStatus.endpoint;
	return `http://${endpoint.hostname}:${endpoint.port}`;
};

export const getRunnerInfoRecords = (state: RootStateType): ImmuMap<RunnerInfoRecord["id"], RunnerInfoRecord>  => state.appStatus.runnerInfo;

export const getRunnerInfoRecord = createSelector(
	[
		getRunnerInfoRecords,
		(state: RootStateType, key: RunnerInfoKey): RunnerInfoKey => key
	],
	(runnerInfo, key): RunnerInfoRecord => runnerInfo.get(key)
);
