import { OrderedMap as ImmuOrderedMap } from "immutable";
import { AppSetting } from "../models/settings";
import { AppSettingRecord, AppSettingValue, appSettingDefaults } from "../models/settings";

const LS_KEY = "@@rnbo_runner_settings@@";
const LS_VERSION = 3;

export const loadSettingsState = (): ImmuOrderedMap<AppSetting, AppSettingRecord> => {
	let storedData: Partial<Record<AppSetting, AppSettingValue>> = {};
	try {
		if (typeof window  == "undefined") throw new Error("Not in Browser");

		const data = window.localStorage?.getItem(LS_KEY);
		if (!data?.length) throw new Error("No Saved Settings found");

		const stored = JSON.parse(data);
		if (stored?.version !== LS_VERSION || !stored?.data) throw new Error("Settings version not compatible");
		storedData = stored.data;
	} catch (err) {
		storedData = {};
	}
	return ImmuOrderedMap<AppSetting, AppSettingRecord>().withMutations(map => {
		for (const id of Object.values(AppSetting)) {
			map.set(id, new AppSettingRecord({
				id,
				...appSettingDefaults[id],
				value: storedData[id] || appSettingDefaults[id].value
			}));
		}
	});
};

export const storeSettingsState = (settings: ImmuOrderedMap<AppSetting, AppSettingRecord>) => {
	if (typeof window == "undefined") return;
	try {
		const data = Object.values(AppSetting).reduce((result, id) => {
			if (settings.has(id)) {
				result[id] = settings.get(id).value;
			}
			return result;
		}, {} as Record<string, AppSettingValue>);

		window.localStorage?.setItem(LS_KEY, JSON.stringify({ version: LS_VERSION, data }));
	} catch (err) {
		// no-op
	}

};

export const purgeSettingsState = (): void => {
	if (typeof window == "undefined") return;
	try {
		window.localStorage?.removeItem(LS_KEY);
	} catch (err) {
		// no-op
	}
};
