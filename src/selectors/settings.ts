import { RootStateType } from "../lib/store";
import { Setting, SettingsValue } from "../reducers/settings";

export const getSettingsAreLoaded = (state: RootStateType) => state.settings.loaded;
export const getSettings = (state: RootStateType) => state.settings.data;
export const getSetting = <T = SettingsValue>(state: RootStateType, key: Setting) => state.settings.data[key] as T;
