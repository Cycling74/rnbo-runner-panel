import { AppStatus } from "../lib/constants";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOState } from "../lib/types";
import { RunnerInfoKey, RunnerInfoRecord, JackInfoKeys } from "../models/runnerInfo";
import { getShowEndpointInfoModal } from "../selectors/appStatus";

export enum StatusActionType {
	SET_STATUS = "SET_STATUS",
	SET_ENDPOINT = "SET_ENDPOINT",
	SET_SHOW_ENDPOINT_INFO = "SET_SHOW_ENDPOINT_INFO",
	INIT_RUNNER_INFO = "INIT_RUNNER_INFO",
	SET_RUNNER_INFO_VALUE = "SET_RUNNER_INFO_VALUE"
}

export interface ISetAppStatus extends ActionBase {
	type: StatusActionType.SET_STATUS;
	payload: {
		error?: Error | undefined;
		status: AppStatus;
	};
}

export interface ISetEndpoint extends ActionBase {
	type: StatusActionType.SET_ENDPOINT;
	payload: {
		hostname: string;
		port: string;
	};
}

export interface ISetShowEndpointInfo extends ActionBase {
	type: StatusActionType.SET_SHOW_ENDPOINT_INFO;
	payload: {
		show: boolean;
	};
}

export interface IInitRunnerInfo extends ActionBase {
	type: StatusActionType.INIT_RUNNER_INFO;
	payload: {
		records: RunnerInfoRecord[];
	};
}

export interface ISetRunnerInfoValue extends ActionBase {
	type: StatusActionType.SET_RUNNER_INFO_VALUE;
	payload: {
		record: RunnerInfoRecord;
	};
}


export type StatusAction = ISetAppStatus | ISetEndpoint | ISetShowEndpointInfo | IInitRunnerInfo | ISetRunnerInfoValue

export const setAppStatus = (status: AppStatus, error?: Error): StatusAction => {
	return {
		type: StatusActionType.SET_STATUS,
		payload: {
			error,
			status
		}
	};
};

export const setConnectionEndpoint = (hostname: string, port: string): StatusAction => {
	return {
		type: StatusActionType.SET_ENDPOINT,
		payload: {
			hostname,
			port
		}
	};
};

export const showEndpointInfo = (): StatusAction => {
	return {
		type: StatusActionType.SET_SHOW_ENDPOINT_INFO,
		payload: {
			show: true
		}
	};
};

export const hideEndpointInfo = (): StatusAction => {
	return {
		type: StatusActionType.SET_SHOW_ENDPOINT_INFO,
		payload: {
			show: false
		}
	};
};

export const toggleEndpointInfo = () : AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const isShown = getShowEndpointInfoModal(state);
		dispatch({ type: StatusActionType.SET_SHOW_ENDPOINT_INFO, payload: { show: !isShown } });
	};


export const initRunnerInfo = (desc: OSCQueryRNBOState): StatusAction => {
	const records: RunnerInfoRecord[] = [];

	const versionInfo = desc?.CONTENTS?.info?.CONTENTS?.version;
	if (versionInfo) {
		records.push(RunnerInfoRecord.fromDescription(RunnerInfoKey.RunnerVersion, versionInfo));
	}

	for (const key of JackInfoKeys) {
		const jackInfo = desc?.CONTENTS?.jack?.CONTENTS?.info?.CONTENTS?.[key];
		if (!jackInfo) continue;
		records.push(RunnerInfoRecord.fromDescription(key, jackInfo));
	}
	return {
		type: StatusActionType.INIT_RUNNER_INFO,
		payload: {
			records
		}
	};
};

export const setRunnerInfoValue = (key: RunnerInfoKey, value: RunnerInfoRecord["oscValue"]): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const record = state.appStatus.runnerInfo.get(key);
		if (!record) return;
		dispatch({
			type: StatusActionType.SET_RUNNER_INFO_VALUE,
			payload: {
				record: record.setValue(value)
			}
		});
	};
