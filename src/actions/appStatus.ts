import { AppStatus } from "../lib/constants";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOState } from "../lib/types";
import { RunnerInfoKey, RunnerInfoRecord } from "../models/runnerInfo";
import { getShowEndpointInfoModal } from "../selectors/appStatus";

export enum StatusActionType {
	SET_STATUS = "SET_STATUS",
	SET_ENDPOINT = "SET_ENDPOINT",
	SET_SHOW_ENDPOINT_INFO = "SET_SHOW_ENDPOINT_INFO",
	INIT_RUNNER_INFO = "INIT_RUNNER_INFO"
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


export type StatusAction = ISetAppStatus | ISetEndpoint | ISetShowEndpointInfo | IInitRunnerInfo;

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
	const jackInfoKeys = [RunnerInfoKey.CPULoad, RunnerInfoKey.XRunCount];
	const records: RunnerInfoRecord[] = [];

	for (const key of jackInfoKeys) {
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
