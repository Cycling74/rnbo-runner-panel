import { KeyboardEvent } from "react";
import { AnyJson, JsonMap, OSCQueryStringValueRange, OSCQueryValueRange } from "./types";

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

export const parseParamMetaJSONString = (v: string): JsonMap => {
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

export const validateParamMetaJSONString = (v: string): boolean => {
	try {
		parseParamMetaJSONString(v);
		return true;
	} catch (err) {
		return false;
	}
};
