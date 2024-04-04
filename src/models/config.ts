import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOState, OSCQueryRNBOInstanceConfig, OSCQueryRNBOJackConfig, OSCQueryStringValueRange, OSCQueryValueType, OSCQueryIntValue, OSCQueryStringValue, OSCQueryFloatValue, OSCQueryValueRange, OSCQueryBooleanValue, OSCQueryRNBOConfigState } from "../lib/types";
import { getNumberValueOptions, getStringValueOptions } from "../lib/util";
import { DEFAULT_MIDI_RANGE, DEFAULT_SAMPLE_RATES, SettingsTab } from "../lib/constants";

export type ConfigValue = number | string | boolean;
export type ConfigOptions = string[] | number[];

export enum ConfigKey {

	// Instance
	AutoConnectAudio = "auto_connect_audio",
	AutoConnectAudioIndexed = "auto_connect_audio_indexed",
	AutoConnectMIDI = "auto_connect_midi",
	AutoStartLast = "auto_start_last",
	AudioFadeIn = "audio_fade_in",
	AudioFadeOut = "audio_fade_out",
	PresetMIDIProgramChangeChannel = "preset_midi_program_change_channel",

	// Jack
	PeriodFrames = "period_frames",
	SampleRate = "sample_rate",
	NumPeriods = "num_periods",
	Card = "card",
	MIDISystem = "midi_system",

	// Control Config
	PatcherMIDIProgramChangeChannel = "patcher_midi_program_change_channel",
	ControlAutoConnectMIDI = "control_auto_connect_midi"
}

export type ConfigRecordProps = {
	id: ConfigKey;
	description?: string;
	min?: number;
	max?: number;
	options?: ConfigOptions;
	path: string;
	tab: SettingsTab;
	title: string;

	oscValue: number | string | boolean | null;
	oscType: OSCQueryValueType.String | OSCQueryValueType.True | OSCQueryValueType.False | OSCQueryValueType.Int32 | OSCQueryValueType.Float32 | OSCQueryValueType.Double64;
}

const instanceConfigDetails: Partial<Record<ConfigKey, Omit<ConfigRecordProps, "id" | "oscValue" | "oscType" >>> = {
	[ConfigKey.AutoStartLast]: {
		path: `/rnbo/inst/config/${ConfigKey.AutoStartLast}`,
		tab: SettingsTab.Instance,
		title: "Startup: Auto Start Last Set"
	},
	[ConfigKey.AutoConnectAudio]: {
		path: `/rnbo/inst/config/${ConfigKey.AutoConnectAudio}`,
		tab: SettingsTab.Instance,
		title: "Instance: Auto Connect Audio"
	},
	[ConfigKey.AutoConnectAudioIndexed]: {
		path: `/rnbo/inst/config/${ConfigKey.AutoConnectAudioIndexed}`,
		tab: SettingsTab.Instance,
		title: "Instance: Auto Connect Audio by i/o Index number"
	},
	[ConfigKey.AutoConnectMIDI]: {
		path: `/rnbo/inst/config/${ConfigKey.AutoConnectMIDI}`,
		tab: SettingsTab.Instance,
		title: "Instance: Auto Connect MIDI"
	},
	[ConfigKey.AudioFadeIn]: {
		min: 0,
		max: 2000,
		path: `/rnbo/inst/config/${ConfigKey.AudioFadeIn}`,
		tab: SettingsTab.Instance,
		title: "Instance: Fade In Milliseconds"
	},
	[ConfigKey.AudioFadeOut]: {
		min: 0,
		max: 2000,
		path: `/rnbo/inst/config/${ConfigKey.AudioFadeOut}`,
		tab: SettingsTab.Instance,
		title: "Instance: Fade Out Milliseconds"
	},
	[ConfigKey.PresetMIDIProgramChangeChannel]: {
		options: DEFAULT_MIDI_RANGE,
		path: `/rnbo/inst/config/${ConfigKey.AudioFadeOut}`,
		tab: SettingsTab.Instance,
		title: "Preset: MIDI Program Change Channel"
	}
};

const jackConfigDetails: Partial<Record<ConfigKey, Omit<ConfigRecordProps, "id" | "oscValue" | "oscType" >>> = {
	[ConfigKey.NumPeriods]: {
		options: [2],
		path: `/rnbo/jack/config/${ConfigKey.NumPeriods}`,
		tab: SettingsTab.Audio,
		title: "Audio: Num Periods"
	},
	[ConfigKey.PeriodFrames]: {
		options: [512],
		path: `/rnbo/jack/config/${ConfigKey.PeriodFrames}`,
		tab: SettingsTab.Audio,
		title: "Audio: Period Frames"
	},
	[ConfigKey.SampleRate]: {
		options: DEFAULT_SAMPLE_RATES,
		path: `/rnbo/jack/config/${ConfigKey.SampleRate}`,
		tab: SettingsTab.Audio,
		title: "Audio: Sample Rate"
	},
	[ConfigKey.Card]: {
		path: `/rnbo/jack/config/${ConfigKey.Card}`,
		tab: SettingsTab.Audio,
		title: "Audio: Interface"
	},
	[ConfigKey.MIDISystem]: {
		options: ["seq", "raw"],
		path: `/rnbo/jack/config/${ConfigKey.MIDISystem}`,
		tab: SettingsTab.Audio,
		title: "Audio: MIDI System"
	}
};

const controlConfigDetails: Partial<Record<ConfigKey, Omit<ConfigRecordProps, "id" | "oscValue" | "oscType" >>> = {
	[ConfigKey.PatcherMIDIProgramChangeChannel]: {
		options: DEFAULT_MIDI_RANGE,
		path: `/rnbo/config/${ConfigKey.PatcherMIDIProgramChangeChannel}`,
		tab: SettingsTab.Control,
		title: "Patcher Select: MIDI Program Change Channel"
	},
	[ConfigKey.ControlAutoConnectMIDI]: {
		path: `/rnbo/config/${ConfigKey.ControlAutoConnectMIDI}`,
		tab: SettingsTab.Control,
		title: "RNBO Control: Auto Connect MIDI"
	}
};

type ConfigOSCDescType = OSCQueryStringValue | OSCQueryIntValue | OSCQueryBooleanValue | OSCQueryFloatValue;
type ConfigOscDescRangeType = OSCQueryValueRange | OSCQueryStringValueRange;

export class ConfigRecord extends ImmuRecord<ConfigRecordProps>({
	id: "" as ConfigKey,
	description: "",
	min: undefined,
	max: undefined,
	options: undefined,
	path: "",
	tab: SettingsTab.Instance,
	title: "",

	oscType: OSCQueryValueType.True,
	oscValue: null
}) {

	public setValue(v: ConfigValue) {
		switch (this.oscType) {
			case OSCQueryValueType.True:
			case OSCQueryValueType.False:
				return this.set("oscType", v ? OSCQueryValueType.True : OSCQueryValueType.False);
			case OSCQueryValueType.Float32:
			case OSCQueryValueType.Double64:
			case OSCQueryValueType.Int32:
			case OSCQueryValueType.String:
			default:
				return this.set("oscValue", v);
		}
	}

	public get value(): ConfigValue {
		switch (this.oscType) {
			case OSCQueryValueType.True:
				return true;
			case OSCQueryValueType.False:
				return false;
			case OSCQueryValueType.Float32:
			case OSCQueryValueType.Double64:
			case OSCQueryValueType.Int32:
			case OSCQueryValueType.String:
			default:
				return this.oscValue;
		}
	}

	protected static getConfigOptions(
		desc: ConfigOSCDescType & ConfigOscDescRangeType,
		defaultOptions?: ConfigRecordProps["options"]
	): ConfigRecordProps["options"] {
		if (!desc.RANGE) return defaultOptions;
		let vals = undefined;
		if (desc.TYPE === OSCQueryValueType.String) {
			vals = getStringValueOptions(desc as OSCQueryStringValueRange);
		}
		if (desc.TYPE === OSCQueryValueType.Int32 || desc.TYPE === OSCQueryValueType.Float32) {
			vals = getNumberValueOptions(desc as OSCQueryValueRange);
		}

		return vals && vals.length ? vals : defaultOptions;
	}

	public static ownsJackServer(desc: OSCQueryRNBOState): boolean {
		return (desc.CONTENTS.jack.CONTENTS.info.CONTENTS?.owns_server?.TYPE || "T") === "T";
	}

	public static arrayFromDescription(desc: OSCQueryRNBOState): Array<ConfigRecord> {
		const result: Array<ConfigRecord> = [];

		const instConfig: Partial<OSCQueryRNBOInstanceConfig["CONTENTS"]> = desc.CONTENTS.inst.CONTENTS.config?.CONTENTS || {};
		for (const key of Object.keys(instanceConfigDetails) as Array<keyof OSCQueryRNBOInstanceConfig["CONTENTS"]>) {

			const value = instConfig[key];
			if (!value) continue;

			result.push(new ConfigRecord({
				id: key as ConfigKey,
				...instanceConfigDetails[key as ConfigKey],
				description: value.DESCRIPTION || "",
				options: this.getConfigOptions(value, instanceConfigDetails[key as ConfigKey].options),
				oscValue: value.VALUE,
				oscType: value.TYPE
			}));
		}

		const controlConfig: Partial<OSCQueryRNBOConfigState["CONTENTS"]> = desc.CONTENTS.config.CONTENTS || {};
		for (const key of Object.keys(controlConfigDetails) as Array<keyof OSCQueryRNBOConfigState["CONTENTS"]>) {
			const value = controlConfig[key];
			if (!value) continue;

			result.push(new ConfigRecord({
				id: key as ConfigKey,
				...controlConfigDetails[key as ConfigKey],
				description: value.DESCRIPTION || "",
				options: this.getConfigOptions(value, controlConfigDetails[key as ConfigKey].options),
				oscValue: value.VALUE,
				oscType: value.TYPE
			}));
		}

		// Owns Jack Server and therefore also the configuration?
		const ownServer = this.ownsJackServer(desc);
		if (ownServer) {
			const jackConfig: Partial<OSCQueryRNBOJackConfig["CONTENTS"]> = desc.CONTENTS.jack.CONTENTS.config?.CONTENTS || {};

			for (const key of Object.keys(jackConfigDetails) as Array<keyof OSCQueryRNBOJackConfig["CONTENTS"]>) {
				const value = jackConfig[key];
				if (!value) continue;

				result.push(new ConfigRecord({
					id: key as ConfigKey,
					...jackConfigDetails[key as ConfigKey],
					description: value.DESCRIPTION || "",
					options: this.getConfigOptions(value, jackConfigDetails[key as ConfigKey].options),
					oscValue: value.VALUE,
					oscType: value.TYPE
				}));
			}
		}

		return result;
	}
}
