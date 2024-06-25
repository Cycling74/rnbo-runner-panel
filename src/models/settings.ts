import { Record as ImmuRecord } from "immutable";
import { ParameterSortAttr, SettingsTab, SortOrder } from "../lib/constants";

export enum AppSetting {
	colorScheme = "colorscheme",
	debugMessageOutput = "message_out_debug",
	keyboardMIDIInput = "keyboard_midi_input",
	paramSortAttribute = "parameter_sort_attribute",
	paramSortOrder = "parameter_sort_order"
}

export enum AppSettingType {
	Boolean,
	String,
	Switch
}

export type AppSettingOptions = string[] | Array<{ value: string; label: string; }>;
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
		title: "Color Scheme",
		type: AppSettingType.String,
		value: "light"
	},
	[AppSetting.keyboardMIDIInput]: {
		description: "Activate this Setting to play MIDI notes into an instance using your computer's keyboard, when displaying the Virtual MIDI Keyboard",
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
	},
	[AppSetting.paramSortAttribute]: {
		description: "Configure whether to sort instance parameters by name or 'displayorder'",
		tab: SettingsTab.UI,
		options: [{ label: "Displayorder", value: ParameterSortAttr.Index }, { label: "Name", value: ParameterSortAttr.Name }],
		title: "Parameter List: Sort Attribute",
		type: AppSettingType.String,
		value: ParameterSortAttr.Name
	},
	[AppSetting.paramSortOrder]: {
		description: "Configure in which order to sort instance parameters",
		tab: SettingsTab.UI,
		options: [{ label: "Ascending", value: SortOrder.Asc }, { label: "Descending", value: SortOrder.Desc }],
		title: "Parameter List: Sort Order",
		type: AppSettingType.String,
		value: SortOrder.Asc
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
