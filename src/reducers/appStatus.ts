import { Map as ImmuMap } from "immutable";
import { StatusAction, StatusActionType } from "../actions/appStatus";
import { AppStatus } from "../lib/constants";
import { RunnerInfoRecord } from "../models/runnerInfo";

export interface AppStatusState {
	status: AppStatus,
	error: Error | undefined;
	endpoint: { hostname: string; port: string; };
	showEndpointInfo: boolean;
	runnerInfo: ImmuMap<RunnerInfoRecord["id"], RunnerInfoRecord>;
}

export const appStatus = (state: AppStatusState = {

	error: undefined,
	status: AppStatus.Connecting,
	endpoint: { hostname: "", port: "" },
	showEndpointInfo: false,
	runnerInfo: ImmuMap<RunnerInfoRecord["id"], RunnerInfoRecord>()

}, action: StatusAction): AppStatusState => {

	switch (action.type) {

		case StatusActionType.SET_STATUS: {
			const { status, error } = action.payload;
			return {
				...state,
				status,
				error: error || undefined
			};
		}

		case StatusActionType.SET_ENDPOINT: {
			const { hostname, port } = action.payload;
			return {
				...state,
				endpoint: { hostname, port }
			};
		}

		case StatusActionType.SET_SHOW_ENDPOINT_INFO: {
			const { show } = action.payload;
			return {
				...state,
				showEndpointInfo: show
			};
		}

		case StatusActionType.INIT_RUNNER_INFO: {
			const { records } = action.payload;
			return {
				...state,
				runnerInfo: ImmuMap<RunnerInfoRecord["id"], RunnerInfoRecord>().withMutations(m => {
					for (const r of records) {
						m.set(r.id, r);
					}
				})
			};
		}

		default:
			return state;
	}
};
