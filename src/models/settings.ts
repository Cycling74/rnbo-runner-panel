import { Record as ImmuRecord } from "immutable";
import { SettingsTab } from "../lib/constants";

export enum AppSetting {
	colorScheme = "colorscheme",
	debugMessageOutput = "message_out_debug"
}

export enum AppSettingType {
	Boolean,
	String,
	Switch
}

export type AppSettingOptions = string[];
export type AppSettingValue = string | number | boolean;

export type AppSettingRecordProps = {
	id: AppSetting;
	description?: string;
	options?: AppSettingOptions;
	tab: SettingsTab.UI,
	title: string;
	type: AppSettingType;
	value: AppSettingValue;
}

export const appSettingDefaults: Record<AppSetting, Omit<AppSettingRecordProps, "id">> = {
	[AppSetting.colorScheme]: {
		description: "",
		tab: SettingsTab.UI,
		options: ["light", "dark"],
		title: "Color Scheme",
		type: AppSettingType.Switch,
		value: "light"
	},
	[AppSetting.debugMessageOutput]: {
		description: "Activate this setting to monitor data sent out of [outport] objects on the port control tab of an instance.",
		tab: SettingsTab.UI,
		title: "Monitor Output Ports",
		type: AppSettingType.Boolean,
		value: true
	}
};

export class AppSettingRecord extends ImmuRecord<AppSettingRecordProps>({
	id: "" as AppSetting,
	description: undefined,
	options: undefined,
	tab: SettingsTab.UI,
	title: "",
	type: AppSettingType.Boolean,
	value: true
}) {

}
