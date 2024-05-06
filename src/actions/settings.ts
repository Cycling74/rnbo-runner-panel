import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { ConfigKey, ConfigRecord } from "../models/config";
import { getAppSetting, getRunnerConfig, getRunnerConfigByPath, getShowSettingsModal } from "../selectors/settings";
import { OSCQueryRNBOState, OSCQueryValueType } from "../lib/types";
import { AppSettingRecord, AppSetting, AppSettingValue } from "../models/settings";

export enum SettingsActionType {
	// General
	SET_SHOW_SETTINGS = "SET_SHOW_SETTINGS",

	// App Settings
	LOAD_APP_SETTINGS = "LOAD_SETTINGS",
	SET_APP_SETTING = "SET_SETTING",
	RESET_APP_DEFAULTS = "RESET_SETTINGS_DEFAULTS",

	// Runner Config
	INIT_RUNNER_CONFIG = "INIT_RUNNER_CONFIG",
	UPDATE_RUNNER_CONFIG = "UPDATE_RUNNER_CONFIG"

}

// General
export interface ISetShowSettings extends ActionBase {
	type: SettingsActionType.SET_SHOW_SETTINGS;
	payload: {
		show: boolean;
	};
}

// App Settings
export interface ILoadAppSettings extends ActionBase {
	type: SettingsActionType.LOAD_APP_SETTINGS;
	payload: Record<never, string>;
}

export interface ISetAppSetting extends ActionBase {
	type: SettingsActionType.SET_APP_SETTING;
	payload: {
		record: AppSettingRecord
	}
}

export interface IResetAppSettings extends ActionBase {
	type: SettingsActionType.RESET_APP_DEFAULTS;
	payload: Record<never, string>;
}

// Runner Config
export interface IInitRunnerConfig extends ActionBase {
	type: SettingsActionType.INIT_RUNNER_CONFIG;
	payload: {
		ownsJackServer: boolean;
		records: ConfigRecord[];
	};
}

export interface IUpdateRunnerConfig extends ActionBase {
	type: SettingsActionType.UPDATE_RUNNER_CONFIG;
	payload: {
		record: ConfigRecord;
	};
}

export type SettingsAction = ISetShowSettings | ISetAppSetting | ILoadAppSettings | IResetAppSettings | IInitRunnerConfig | IUpdateRunnerConfig;

// General
export const showSettings = (): SettingsAction => {
	return {
		type: SettingsActionType.SET_SHOW_SETTINGS,
		payload: {
			show: true
		}
	};
};

export const hideSettings = (): SettingsAction => {
	return {
		type: SettingsActionType.SET_SHOW_SETTINGS,
		payload: {
			show: false
		}
	};
};

export const toggleShowSettings = () : AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const isShown = getShowSettingsModal(state);
		dispatch({ type: SettingsActionType.SET_SHOW_SETTINGS, payload: { show: !isShown } });
	};


// App Settings
export const setAppSetting = (id: AppSetting, value: AppSettingValue): AppThunk =>
	(dispatch, getState) => {
		const setting = getAppSetting(getState(), id);
		dispatch({
			type: SettingsActionType.SET_APP_SETTING,
			payload: { record: setting.set("value", value) }
		} as ISetAppSetting);
	};

export const loadAppSettings = (): SettingsAction => {
	return {
		type: SettingsActionType.LOAD_APP_SETTINGS,
		payload: {}
	};
};

export const resetAppSettingsToDefault = (): SettingsAction => {
	return {
		type: SettingsActionType.RESET_APP_DEFAULTS,
		payload: {}
	};
};

// Runner Config
const sendTypedRunnerConfig = (path: string, type: OSCQueryValueType, value: number | string): void => {
	oscQueryBridge.sendPacket(writePacket({
		address: path,
		args: [{ value, type }]
	}));
};

const sendRunnerConfig = (config: ConfigRecord, value: ConfigRecord["value"]): void => {
	try {
		switch (config.oscType) {
			case OSCQueryValueType.True:
			case OSCQueryValueType.False: {
				return void sendTypedRunnerConfig(config.path, value ? OSCQueryValueType.True : OSCQueryValueType.False, value ? "true" : "false");
			}
			case OSCQueryValueType.Float32:
			case OSCQueryValueType.Double64: {
				const v = typeof value !== "number" ? parseFloat(value as string) : value;
				return void sendTypedRunnerConfig(config.path, config.oscType, v);
			}
			case OSCQueryValueType.Int32: {
				const v = typeof value !== "number" ? parseInt(value as string, 10) : value;
				return void sendTypedRunnerConfig(config.path, config.oscType, v);
			}
			case OSCQueryValueType.String:
			default:
				return void sendTypedRunnerConfig(config.path, config.oscType, value as string | number);
		}
	} catch (err) {
		console.log(err);
		return;
	}
};

export const initRunnerConfig = (desc: OSCQueryRNBOState): SettingsAction => {
	const records = ConfigRecord.arrayFromDescription(desc);
	return {
		type: SettingsActionType.INIT_RUNNER_CONFIG,
		payload: {
			ownsJackServer: ConfigRecord.ownsJackServer(desc),
			records
		}
	};
};

export const setRunnerConfig = (id: ConfigKey, value: ConfigRecord["value"]) : AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const config = getRunnerConfig(state, id);
		if (!config) return;
		sendRunnerConfig(config, value);
		dispatch({
			type: SettingsActionType.UPDATE_RUNNER_CONFIG,
			payload: {
				record: config.setValue(value)
			}
		});
	};

export const updateRunnerConfig = (path: string, value: ConfigRecord["value"]): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const config = getRunnerConfigByPath(state, path);
		if (!config) return;

		dispatch({
			type: SettingsActionType.UPDATE_RUNNER_CONFIG,
			payload: {
				record: config.setValue(value)
			}
		});
	};

export const updateRunnerAudio = (): AppThunk =>
	(dispatch) => {
		oscQueryBridge.sendPacket(writePacket({
			address: "/rnbo/jack/restart",
			args: [{ value: "true", type: "T" }]
		}));
		dispatch(hideSettings());
	};

