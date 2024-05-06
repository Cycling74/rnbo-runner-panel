import { OrderedMap as ImmuOrderedMap } from "immutable";
import { SettingsAction, SettingsActionType } from "../actions/settings";
import { AppSetting } from "../models/settings";
import { ConfigKey, ConfigRecord } from "../models/config";
import { AppSettingRecord } from "../models/settings";
import { loadSettingsState, purgeSettingsState, storeSettingsState } from "../lib/settings";

export type AppSettings = {
	[AppSetting.colorScheme]: string;
	[AppSetting.debugMessageOutput]: boolean;
}

export type SettingsState = {
	loaded: boolean;
	show: boolean;
	ownsJackServer: boolean;

	appSettings: ImmuOrderedMap<AppSetting, AppSettingRecord>;
	runnerConfig: ImmuOrderedMap<ConfigKey, ConfigRecord>;
}

const defaultState: SettingsState = {
	loaded: false,
	show: false,
	ownsJackServer: false,

	appSettings: loadSettingsState(),
	runnerConfig: ImmuOrderedMap<ConfigKey, ConfigRecord>()
};


export const settings = (state: SettingsState = defaultState, action: SettingsAction): SettingsState => {

	switch (action.type) {

		// General
		case SettingsActionType.SET_SHOW_SETTINGS: {
			return {
				...state,
				show: action.payload.show
			};
		}

		// App Settings
		case SettingsActionType.LOAD_APP_SETTINGS: {
			return {
				...state,
				loaded: true,
				appSettings: loadSettingsState()
			};
		}

		case SettingsActionType.SET_APP_SETTING: {
			const { record } = action.payload;
			const appSettings = state.appSettings.set(record.id, record);
			storeSettingsState(appSettings);
			return {
				...state,
				appSettings
			};
		}

		case SettingsActionType.RESET_APP_DEFAULTS: {
			purgeSettingsState();
			return {
				...state,
				appSettings: defaultState.appSettings
			};
		}

		// Runner Config
		case SettingsActionType.INIT_RUNNER_CONFIG: {
			const { ownsJackServer, records } = action.payload;
			return {
				...state,
				ownsJackServer,
				runnerConfig: ImmuOrderedMap<ConfigKey, ConfigRecord>(records.map(r => [r.id, r]))
			};
		}

		case SettingsActionType.UPDATE_RUNNER_CONFIG: {
			const { record } = action.payload;
			return {
				...state,
				runnerConfig: state.runnerConfig.set(record.id, record)
			};
		}

		default:
			return state;
	}
};
