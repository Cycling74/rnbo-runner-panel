import { ActionBase, AppThunk } from "../lib/store";
import { Setting, SettingsValue } from "../reducers/settings";
import { getShowSettingsModal } from "../selectors/settings";

export enum SettingsActionType {
	LOAD_SETTINGS = "LOAD_SETTINGS",
	SET_SETTING = "SET_SETTING",
	RESET_DEFAULTS = "RESET_SETTINGS_DEFAULTS",
	SET_SHOW_SETTINGS = "SET_SHOW_SETTINGS"
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

export interface ISetShowSettings extends ActionBase {
	type: SettingsActionType.SET_SHOW_SETTINGS;
	payload: {
		show: boolean;
	};
}

export type SettingsAction = ISetSetting | ILoadSettings | IResetSettings | ISetShowSettings;

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
