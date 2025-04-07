import { KeyboardEvent, memo } from "react";
import { AnyJson, JsonMap, MIDIChannelPressureMetaMapping, MIDIControlChangeMetaMapping, MIDIKeypressMetaMapping, MIDIMetaMapping, MIDINoteMetaMapping, MIDIPitchBendMetaMapping, MIDIProgramChangeMetaMapping, OSCQueryStringValueRange, OSCQueryValueRange } from "./types";
import { MIDIMetaMappingType, nodePortHeight, nodePortSpacing, UnsavedSetName } from "./constants";

export const genericMemo: <P>(component: P) => P = memo;

export const sleep = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export const clamp = (num: number, min: number, max: number): number => {
	return Math.min(Math.max(num, min), max);
};

export const scale = (x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number => {
	return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

export const getUniqueName = (newName: string, existing: string[]): string => {
	if (!existing.includes(newName)) return newName;
	let counter = 1;
	while (existing.includes(`${newName} - ${counter}`)) {
		counter++;
	}
	return `${newName} - ${counter}`;
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

export const instanceAndParamIndicesToSetViewEntry = (instanceId: string, paramName: string) => `${instanceId}:${paramName}`;

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
			return "Unknown";
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

const parseMIDIByte = (val: string, min: number, max: number): number | null => {
	if (val === undefined) return null;
	const n = parseInt(val, 10);
	if (isNaN(n) || n < min || n > max) return null;
	return n;
};

export class InvalidMIDIFormatError extends Error {
	constructor() {
		super("Invalid MIDI mapping");
	}
}

export class UnknownMIDIFormatError extends Error {
	constructor() {
		super("Unknown MIDI mapping format");
	}
}

export const parseMIDIMappingDisplayValue = (value: string): { type: MIDIMetaMappingType, mapping: MIDIMetaMapping } => {
	for (const [mappingType, reg] of Object.entries(midiMetaRegexp) as Array<[MIDIMetaMappingType, RegExp]>) {
		const match = value.match(reg);
		if (!match) continue;

		switch (mappingType) {
			case MIDIMetaMappingType.ChannelPressure: {
				const chanpress = parseMIDIByte(match.groups?.chanpress, 1, 16);
				if (chanpress === null) throw new Error(`"${value}" is not a valid MIDI mapping format`);
				return {
					type: MIDIMetaMappingType.ChannelPressure,
					mapping: { chanpress } as MIDIChannelPressureMetaMapping
				};
			}
			case MIDIMetaMappingType.ControlChange: {
				const chan = parseMIDIByte(match.groups?.chan, 1, 16);
				const ctrl = parseMIDIByte(match.groups?.ctrl, 0, 127);
				if (chan === null || ctrl === null) throw new InvalidMIDIFormatError();

				return {
					type: MIDIMetaMappingType.ControlChange,
					mapping: { chan, ctrl } as MIDIControlChangeMetaMapping
				};
			}
			case MIDIMetaMappingType.KeyPressure: {
				const chan = parseMIDIByte(match.groups?.chan, 1, 16);
				const keypress = parseMIDIByte(match.groups?.keypress, 0, 127);
				if (chan === null || keypress === null) throw new InvalidMIDIFormatError();

				return {
					type: MIDIMetaMappingType.KeyPressure,
					mapping: { chan, keypress } as MIDIKeypressMetaMapping
				};

			}
			case MIDIMetaMappingType.Note: {
				const chan = parseMIDIByte(match.groups?.chan, 1, 16);
				const note = parseMIDIByte(match.groups?.note, 0, 127);
				if (chan === null || note === null) throw new InvalidMIDIFormatError();

				return {
					type: MIDIMetaMappingType.Note,
					mapping: { chan, note } as MIDINoteMetaMapping
				};

			}
			case MIDIMetaMappingType.PitchBend: {
				const bend = parseMIDIByte(match.groups?.bend, 1, 16);
				if (bend === null) throw new InvalidMIDIFormatError();

				return {
					type: MIDIMetaMappingType.PitchBend,
					mapping: { bend } as MIDIPitchBendMetaMapping
				};

			}
			case MIDIMetaMappingType.ProgramChange: {
				const prgchg = parseMIDIByte(match.groups?.prgchg, 1, 16);
				if (prgchg === null) throw new InvalidMIDIFormatError();

				return {
					type: MIDIMetaMappingType.ProgramChange,
					mapping: { prgchg } as MIDIProgramChangeMetaMapping
				};
			}

			default: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const _exhaustive: never = mappingType;
			}
		}
	}

	throw new UnknownMIDIFormatError();
};

export const calculateNodeContentHeight = (sinkCount: number, sourceCount: number): number => {
	return (sinkCount > sourceCount ? sinkCount : sourceCount) * (nodePortHeight + nodePortSpacing);
};

export const validateGraphSetName = (v: string): true | string => {
	const value = v.trim();
	if (!value?.length) return "Please provide a valid, non empty name.";
	if (value === UnsavedSetName) return `"${UnsavedSetName}" is a reserved name, please use a non-reserved name.`;
	return true;
};

export const validatePresetName = (v: string): true | string => {
	const value = v.trim();
	if (!value?.length) return "Please provide a valid, non empty name.";
	return true;
};

export const validateSetViewName = (v: string): true | string => {
	const value = v.trim();
	if (!value?.length) return "Please provide a valid, non empty name.";
	return true;
};

export const validatePatcherInstanceAlias = (v: string): true | string => {
	const value = v.trim();
	if (!value?.length) return "Please provide a valid, non empty name.";
	return true;
};
