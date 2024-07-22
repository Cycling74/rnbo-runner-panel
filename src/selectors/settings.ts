import { createSelector } from "reselect";
import { SettingsTab } from "../lib/constants";
import { RootStateType } from "../lib/store";
import { ConfigRecord } from "../models/config";
import { AppSetting, AppSettingRecord } from "../models/settings";
import { OrderedMap } from "immutable";


// General
export const getShowSettingsModal = (state: RootStateType): boolean => state.settings.show;

export const getSettingsAreLoaded = (state: RootStateType): boolean => state.settings.loaded;

// App Settings
export const getAppSettings = (state: RootStateType): OrderedMap<AppSettingRecord["id"], AppSettingRecord> => state.settings.appSettings;

export const getAppSettingsForTab = createSelector(
	[
		getAppSettings,
		(state: RootStateType, tab: SettingsTab): SettingsTab => tab
	],
	(appSettings, tab: SettingsTab) => appSettings.valueSeq().filter(s => s.tab === tab)
);

export const getAppSetting = createSelector(
	[
		getAppSettings,
		(state: RootStateType, id: AppSetting): AppSetting => id
	],
	(settings, id): AppSettingRecord => {
		return settings.get(id);
	}
);

// Runner Config
export const getRunnerOwnsJackServer = (state: RootStateType): boolean => state.settings.ownsJackServer;
export const getRunnerConfigs = (state: RootStateType): OrderedMap<ConfigRecord["id"], ConfigRecord> => state.settings.runnerConfig;

export const getRunnerConfig = createSelector(
	[
		getRunnerConfigs,
		(state: RootStateType, id: ConfigRecord["id"]): ConfigRecord["id"] => id
	],
	(runnerConfig, id): ConfigRecord => runnerConfig.get(id)
);

export const getRunnerConfigForTab = createSelector(
	[
		getRunnerConfigs,
		(state: RootStateType, tab: SettingsTab): SettingsTab => tab
	],
	(runnerConfig, tab: SettingsTab) => runnerConfig.valueSeq().filter(c => c.tab === tab)
);

export const getRunnerConfigByPath = createSelector(
	[
		getRunnerConfigs,
		(state: RootStateType, path: string): string => path
	],
	(runnerConfig, path): ConfigRecord | undefined => runnerConfig.find(rec => rec.path === path)
);

export const getSettingsItemsForTab = (state: RootStateType, tab: SettingsTab): Array<AppSettingRecord | ConfigRecord> => {

	return [
		...getAppSettingsForTab(state, tab).toArray(),
		...getRunnerConfigForTab(state, tab).toArray()
	];
};
