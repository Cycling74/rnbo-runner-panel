import { OSCQueryStringValueRange, OSCQueryValueRange } from "./types";

export const sleep = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export const clamp = (num: number, min: number, max: number): number => {
	return Math.min(Math.max(num, min), max);
};

export const scale = (x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number => {
	return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

export const getStringValueRange = (range?: OSCQueryStringValueRange): string[] => {
	return range?.RANGE?.[0]?.VALS || [];
};

export const getNumberValueRange = (range?: OSCQueryValueRange): number[] => {
	return range?.RANGE?.[0]?.VALS || [];
};
