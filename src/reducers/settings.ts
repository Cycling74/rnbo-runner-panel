import { SettingsAction, SettingsActionType } from "../actions/settings";

export enum Setting {
	colorScheme = "colorscheme"
}

export type SettingsValue = string | number | boolean;

export type SettingsState = {
	loaded: boolean;
	data: Record<Setting, SettingsValue>;
}

const LS_KEY = "@@rnbo_runner_settings@@";
const LS_VERSION = 1;

const defaultState: SettingsState = {
	loaded: false,
	data: {
		[Setting.colorScheme]: "light"
	}
};

const loadState = (): SettingsState["data"] => {
	if (typeof window == "undefined") return defaultState.data;
	try {
		const data = window.localStorage?.getItem(LS_KEY);
		if (!data?.length) throw new Error("No Saved Settings found");
		const stored = JSON.parse(data);
		if (stored?.version !== LS_VERSION || !stored?.data) throw new Error("Settings version not compatible");
		return stored.data as SettingsState["data"];
	} catch (err) {
		return defaultState.data;
	}
};

const saveState = (data: SettingsState["data"]) => {
	if (typeof window == "undefined") return;
	try {
		window.localStorage?.setItem(LS_KEY, JSON.stringify({ version: LS_VERSION, data }));
	} catch (err) {
		// no-op
	}
};

const deleteState = () => {
	if (typeof window == "undefined") return;
	try {
		window.localStorage?.removeItem(LS_KEY);
	} catch (err) {
		// no-op
	}
};

export const settings = (state: SettingsState = defaultState, action: SettingsAction): SettingsState => {

	switch (action.type) {

		case SettingsActionType.LOAD_SETTINGS: {
			return {
				loaded: true,
				data: loadState()
			};
		}

		case SettingsActionType.SET_SETTING: {
			const { name, value } = action.payload;
			const data = { ...state.data, [name]: value };
			saveState(data);
			return {
				...state,
				data
			};
		}

		case SettingsActionType.RESET_DEFAULTS: {
			deleteState();
			return {
				...state,
				data: defaultState.data
			};
		}

		default:
			return state;
	}
};
