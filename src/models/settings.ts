import { Record as ImmuRecord } from "immutable";
import { SettingsTab } from "../lib/constants";

export enum AppSetting {
	colorScheme = "colorscheme",
	debugMessageOutput = "message_out_debug",
	keyboardMIDIInput = "keyboard_midi_input"
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
		description: "Select the color scheme of the user interface",
		tab: SettingsTab.UI,
		options: ["light", "dark"],
		title: "Theme",
		type: AppSettingType.String,
		value: "light"
	},
	[AppSetting.keyboardMIDIInput]: {
		description: "Activate this Setting to play MIDI notes into an instance using your computer's keyboard, when displaying the MIDI control tab",
		tab: SettingsTab.UI,
		title: "Computer MIDI Keyboard",
		type: AppSettingType.Boolean,
		value: true
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
