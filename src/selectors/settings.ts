import { createSelector } from "reselect";
import { SettingsTab } from "../lib/constants";
import { RootStateType } from "../lib/store";
import { ConfigKey, ConfigRecord, ConfigValue } from "../models/config";
import { AppSetting, AppSettingRecord, AppSettingValue } from "../models/settings";
import { OrderedMap } from "immutable";

// General
export const getShowSettingsModal = (state: RootStateType): boolean => state.settings.show;
export const getSettingsAreLoaded = (state: RootStateType) => state.settings.loaded;

// App Settings
export const getAppSettings = (state: RootStateType) => state.settings.appSettings;
export const getAppSettingsForTab = createSelector(
	[
		getAppSettings,
		(state: RootStateType, tab: SettingsTab): SettingsTab => tab
	],
	(appSettings, tab: SettingsTab) => appSettings.valueSeq().filter(s => s.tab === tab)
);
export const getAppSetting = (state: RootStateType, id: AppSetting): AppSettingRecord => state.settings.appSettings.get(id);
export const getAppSettingValue = <T = AppSettingValue>(state: RootStateType, id: AppSetting): T => state.settings.appSettings.get(id).value as T;

// Runner Config
export const getRunnerOwnsJackServer = (state: RootStateType): boolean => state.settings.ownsJackServer;
export const getRunnerConfigs = (state: RootStateType): OrderedMap<ConfigRecord["id"], ConfigRecord> => state.settings.runnerConfig;
export const getRunnerConfig = (state: RootStateType, id: ConfigKey): ConfigRecord => state.settings.runnerConfig.get(id);
export const getRunnerConfigForTab = createSelector(
	[
		getRunnerConfigs,
		(state: RootStateType, tab: SettingsTab): SettingsTab => tab
	],
	(runnerConfig, tab: SettingsTab) => runnerConfig.valueSeq().filter(c => c.tab === tab)
);
export const getRunnerConfigByPath = (state: RootStateType, path: string): ConfigRecord | undefined => state.settings.runnerConfig.find(rec => rec.path === path);
export const getRunnerConfigValue = <T = ConfigValue >(state: RootStateType, id: ConfigKey): T => state.settings.runnerConfig.get(id).value as T;
export const getRunnerConfigValueByPath = <T = ConfigValue >(state: RootStateType, path: string): T | undefined => getRunnerConfigByPath(state, path)?.value as T| undefined;

export const getSettingsItemsForTab = (state: RootStateType, tab: SettingsTab): Array<AppSettingRecord | ConfigRecord> => {

	return [
		...getAppSettingsForTab(state, tab).toArray(),
		...getRunnerConfigForTab(state, tab).toArray()
	];
};
