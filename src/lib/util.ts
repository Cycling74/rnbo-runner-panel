import { KeyboardEvent } from "react";
import { OSCQueryStringValueRange, OSCQueryValueRange } from "./types";

export const sleep = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export const clamp = (num: number, min: number, max: number): number => {
	return Math.min(Math.max(num, min), max);
};

export const scale = (x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number => {
	return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

export const getStringValueOptions = (range?: OSCQueryStringValueRange): string[] => {
	return range?.RANGE?.[0]?.VALS || [];
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
