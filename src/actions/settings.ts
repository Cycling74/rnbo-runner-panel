import { ActionBase } from "../lib/store";
import { Setting, SettingsValue } from "../reducers/settings";

export enum SettingsActionType {
	LOAD_SETTINGS = "LOAD_SETTINGS",
	SET_SETTING = "SET_SETTING",
	RESET_DEFAULTS = "RESET_DEFAULTS"
}

export interface ILoadSettings extends ActionBase {
	type: SettingsActionType.LOAD_SETTINGS;
	payload: Record<never, string>;
}

export interface ISetSetting extends ActionBase {
	type: SettingsActionType.SET_SETTING;
	payload: {
		name: Setting;
		value: SettingsValue;
	};
}

export interface IResetSettings extends ActionBase {
	type: SettingsActionType.RESET_DEFAULTS;
	payload: Record<never, string>;
}

export type SettingsAction = ISetSetting | ILoadSettings | IResetSettings;

export const setSetting = (name: Setting, value: SettingsValue): SettingsAction => {
	return {
		type: SettingsActionType.SET_SETTING,
		payload: {
			name,
			value
		}
	};
};

export const loadSettings = (): SettingsAction => {
	return {
		type: SettingsActionType.LOAD_SETTINGS,
		payload: {}
	};
};

export const resetSettingsToDefault = (): SettingsAction => {
	return {
		type: SettingsActionType.RESET_DEFAULTS,
		payload: {}
	};
};
