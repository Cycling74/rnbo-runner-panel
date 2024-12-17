import { KeyboardEvent } from "react";
import { AnyJson, JsonMap, MIDIChannelPressureMetaMapping, MIDIControlChangeMetaMapping, MIDIKeypressMetaMapping, MIDIMetaMapping, MIDINoteMetaMapping, MIDIPitchBendMetaMapping, MIDIProgramChangeMetaMapping, OSCQueryStringValueRange, OSCQueryValueRange } from "./types";
import { MIDIMetaMappingType } from "./constants";

export const sleep = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export const clamp = (num: number, min: number, max: number): number => {
	return Math.min(Math.max(num, min), max);
};

export const scale = (x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number => {
	return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

export const getStringValueOptions = (range?: OSCQueryStringValueRange): string[] | undefined => {
	return range?.RANGE?.[0]?.VALS;
};

export const getNumberValueOptions = (range?: OSCQueryValueRange): number[] => {
	return range?.RANGE?.[0]?.VALS || [];
};

export const keyEventIsValidForName = (event: KeyboardEvent): boolean => {
	// Allow Meta and Functional Keys
	if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.key.length > 1) {
		return true;
	}
	return /^[a-z0-9.,_-\s]$/i.test(event.key);
};

export const replaceInvalidNameChars = (text: string) => text.replaceAll(/[^a-z0-9.,_-\s]/ig, "");

const fileSizeUnits = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

export const formatFileSize = (size: number): string => {
	if (size === 0) return "0 Bytes";
	const exp = Math.floor(Math.log(size) / Math.log(1000));
	return (size / Math.pow(1000, exp)).toFixed(exp >= 2 ? 2 : 0) + " " + fileSizeUnits[exp];
};

export const parseMetaJSONString = (v: string): JsonMap => {
	if (!v?.length) return {};

	let parsed: AnyJson;
	try {
		parsed = JSON.parse(v);
	} catch (err) {
		throw new Error("Invalid JSON syntax.");
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid Meta JSON format. Meta is expected to be a JSON object.");

	return parsed;
};

export const validateMetaJSONString = (v: string): boolean => {
	try {
		parseMetaJSONString(v);
		return true;
	} catch (err) {
		return false;
	}
};

export const formatParamValueForDisplay = (value: number | string) => {
	if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(2);
	return value;
};

export const cloneJSON = (value: JsonMap): JsonMap => JSON.parse(JSON.stringify(value));

export const formatMIDIMappingToDisplay = (type: MIDIMetaMappingType, mapping: MIDIMetaMapping): string => {
	switch (type) {
		case MIDIMetaMappingType.ChannelPressure: {
			return `CPRESS/${(mapping as MIDIChannelPressureMetaMapping).chanpress}`;
		}
		case MIDIMetaMappingType.ControlChange: {
			return `CC#${(mapping as MIDIControlChangeMetaMapping).ctrl}/${(mapping as MIDIControlChangeMetaMapping).chan}`;
		}
		case MIDIMetaMappingType.KeyPressure: {
			return `KPRESS#${(mapping as MIDIKeypressMetaMapping).keypress}/${(mapping as MIDIKeypressMetaMapping).chan}`;
		}
		case MIDIMetaMappingType.Note: {
			return `NOTE#${(mapping as MIDINoteMetaMapping).note}/${(mapping as MIDINoteMetaMapping).chan}`;
		}
		case MIDIMetaMappingType.PitchBend: {
			return `BEND/${(mapping as MIDIPitchBendMetaMapping).bend}`;
		}
		case MIDIMetaMappingType.ProgramChange: {
			return `PRGCHG/${(mapping as MIDIProgramChangeMetaMapping).prgchg}`;
		}
		default: {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const _exhaustive: never = type;
			throw new Error(`Unknown MIDIMappingType "${type}"`);
		}
	}
};

const midiMetaRegexp: Record<MIDIMetaMappingType, RegExp> = {
	[MIDIMetaMappingType.ChannelPressure]: /^CPRESS\/(?<chanpress>[0-9]{1,2})$/,
	[MIDIMetaMappingType.ControlChange]: /^CC#(?<ctrl>[0-9]{1,3})\/(?<chan>[0-9]{1,2})$/,
	[MIDIMetaMappingType.KeyPressure]: /^KPRESS#(?<keypress>[0-9]{1,3})\/(?<chan>[0-9]{1,2})$/,
	[MIDIMetaMappingType.Note]: /^NOTE#(?<note>[0-9]{1,3})\/(?<chan>[0-9]{1,2})$/,
	[MIDIMetaMappingType.PitchBend]: /^BEND\/(?<bend>[0-9]{1,2})$/,
	[MIDIMetaMappingType.ProgramChange]: /^PRGCHG\/(?<prgchg>[0-9]{1,2})$/
};

export const parseMIDIMappingDisplayValue = (value: string): false | { type: MIDIMetaMappingType, mapping: MIDIMetaMapping } => {
	for (const [mappingType, reg] of Object.entries(midiMetaRegexp) as Array<[MIDIMetaMappingType, RegExp]>) {
		const match = value.match(reg);
		if (!match) continue;

		switch (mappingType) {
			case MIDIMetaMappingType.ChannelPressure: {
				const chanpress = parseInt(match.groups.chanpress, 10);
				if (isNaN(chanpress) || chanpress < 1 || chanpress > 16) return false;
				return {
					type: MIDIMetaMappingType.ChannelPressure,
					mapping: { chanpress } as MIDIChannelPressureMetaMapping
				};
			}
			case MIDIMetaMappingType.ControlChange: {
				const chan = parseInt(match.groups.chan, 10);
				if (isNaN(chan) || chan < 1 || chan > 16) return false;

				const ctrl = parseInt(match.groups.ctrl, 10);
				if (isNaN(ctrl) || ctrl < 0 || ctrl > 127) return false;

				return {
					type: MIDIMetaMappingType.ControlChange,
					mapping: { chan, ctrl } as MIDIControlChangeMetaMapping
				};
			}
			case MIDIMetaMappingType.KeyPressure: {
				const chan = parseInt(match.groups.chan, 10);
				if (isNaN(chan) || chan < 1 || chan > 16) return false;

				const keypress = parseInt(match.groups.keypress, 10);
				if (isNaN(keypress) || keypress < 0 || keypress > 127) return false;

				return {
					type: MIDIMetaMappingType.KeyPressure,
					mapping: { chan, keypress } as MIDIKeypressMetaMapping
				};

			}
			case MIDIMetaMappingType.Note: {
				const chan = parseInt(match.groups.chan, 10);
				if (isNaN(chan) || chan < 1 || chan > 16) return false;

				const note = parseInt(match.groups.note, 10);
				if (isNaN(note) || note < 0 || note > 127) return false;

				return {
					type: MIDIMetaMappingType.Note,
					mapping: { chan, note } as MIDINoteMetaMapping
				};

			}
			case MIDIMetaMappingType.PitchBend: {
				const bend = parseInt(match.groups.bend, 10);
				if (isNaN(bend) || bend < 1 || bend > 16) return false;
				return {
					type: MIDIMetaMappingType.PitchBend,
					mapping: { bend } as MIDIPitchBendMetaMapping
				};

			}
			case MIDIMetaMappingType.ProgramChange: {
				const prgchg = parseInt(match.groups.prgchg, 10);
				if (isNaN(prgchg) || prgchg < 1 || prgchg > 16) return false;
				return {
					type: MIDIMetaMappingType.ProgramChange,
					mapping: { prgchg } as MIDIProgramChangeMetaMapping
				};
			}

			default: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const _exhaustive: never = mappingType;
				throw new Error(`Unknown MIDIMappingType "${mappingType}"`);
			}
		}
	}

	return false;
};
