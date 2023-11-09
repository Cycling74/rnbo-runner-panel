import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOState, OSCQueryStringValueRange, OSCQueryValueRange } from "../lib/types";

export enum ConfigBase {
	Base = "",
	Jack = "/jack",
	Instance = "/inst"
}

export type ConfigValueType = number | string | boolean;

export type ConfigProps = {
	patcher_midi_program_change_channel: string;
	patcher_midi_program_change_channel_options: string[];
	control_auto_connect_midi: boolean;

	instance: {
		auto_connect_audio: boolean;
		auto_connect_audio_indexed: boolean;
		auto_connect_midi: boolean;
		auto_start_last: boolean;
		audio_fade_in: number;
		audio_fade_out: number;
		preset_midi_program_change_channel: string;
		preset_midi_program_change_channel_options: string[];
	};

	jack: {
		period_frames: number;
		period_frame_options: number[];

		sample_rate: number;
		sample_rate_options: number[];

		num_periods?: number;
		num_period_options?: number[];

		card?: string;
		card_options?: string[];
	}
}

const DEFAULT_MIDI_RANGE = ["none", "omni", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];

const get_midi_range = (range?: OSCQueryStringValueRange): string[] => {
	return range?.RANGE?.[0]?.VALS || DEFAULT_MIDI_RANGE;
};

const get_string_range = (range?: OSCQueryStringValueRange): string[] => {
	return range?.RANGE?.[0]?.VALS || [];
};

const get_number_range = (range?: OSCQueryValueRange): number[] => {
	return range?.RANGE?.[0]?.VALS || [];
};

export class Config extends ImmuRecord<ConfigProps>({
	patcher_midi_program_change_channel: "omni",
	patcher_midi_program_change_channel_options: DEFAULT_MIDI_RANGE,
	control_auto_connect_midi: true,

	instance: {
		auto_connect_audio: true,
		auto_connect_audio_indexed: true,
		auto_connect_midi: true,
		auto_start_last: true,
		audio_fade_in: 10,
		audio_fade_out: 10,
		preset_midi_program_change_channel: "none",
		preset_midi_program_change_channel_options: DEFAULT_MIDI_RANGE
	},

	jack: {
		period_frames: 512,
		period_frame_options: [512],

		sample_rate: 48000,
		sample_rate_options: [44100, 48000],

		num_periods: 2,
		num_period_options: [2],

		card: "",
		card_options: []
	}

}) {

	static fromDescription(desc: OSCQueryRNBOState): Config {
		const top = desc.CONTENTS.config.CONTENTS;
		const inst = desc.CONTENTS.inst.CONTENTS.config.CONTENTS;
		const jack = desc.CONTENTS.jack.CONTENTS.config.CONTENTS;

		return new Config({
			patcher_midi_program_change_channel: top.patcher_midi_program_change_channel.VALUE as string,
			patcher_midi_program_change_channel_options: get_midi_range(top.patcher_midi_program_change_channel),
			control_auto_connect_midi: top.control_auto_connect_midi.TYPE === "T",

			instance: {
				auto_connect_audio: inst.auto_connect_audio.TYPE === "T",
				auto_connect_audio_indexed: inst.auto_connect_audio_indexed.TYPE === "T",
				auto_connect_midi: inst.auto_connect_midi.TYPE === "T",
				auto_start_last: inst.auto_start_last.TYPE === "T",
				audio_fade_in: inst.audio_fade_in.VALUE as number,
				audio_fade_out: inst.audio_fade_out.VALUE as number,
				preset_midi_program_change_channel: inst.preset_midi_program_change_channel.VALUE as string,
				preset_midi_program_change_channel_options: get_midi_range(inst.preset_midi_program_change_channel)
			},

			jack: {
				period_frames: jack.period_frames.VALUE as number,
				period_frame_options: get_number_range(jack.period_frames),

				sample_rate: jack.sample_rate.VALUE as number,
				sample_rate_options: get_number_range(jack.sample_rate),

				num_periods: jack?.num_periods?.VALUE as number,
				num_period_options: get_number_range(jack.num_periods),

				card: jack?.card?.VALUE as string,
				card_options: get_string_range(jack?.card)
			}
		});
	}

}
