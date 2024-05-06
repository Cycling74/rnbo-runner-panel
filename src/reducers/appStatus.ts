import { StatusAction, StatusActionType } from "../actions/appStatus";
import { AppStatus } from "../lib/constants";

export interface AppStatusState {
	status: AppStatus,
	error: Error | undefined;
	endpoint: { hostname: string; port: string; };
	showEndpointInfo: boolean;
}

export const appStatus = (state: AppStatusState = {

	error: undefined,
	status: AppStatus.Connecting,
	endpoint: { hostname: "", port: "" },
	showEndpointInfo: false

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

		default:
			return state;
	}
};
