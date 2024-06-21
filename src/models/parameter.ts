import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceParameterInfo, OSCQueryRNBOInstanceParameterValue } from "../lib/types";

export type ParameterRecordProps = {
	enumVals: Array<string | number>;
	index: number;
	min: number;
	max: number;
	meta: string;
	name: string;
	normalizedValue: number;
	path: string;
	type: string;
	value: string | number;
	waitingForMidiMapping: boolean;
	isMidiMapped: boolean;
}
export class ParameterRecord extends ImmuRecord<ParameterRecordProps>({

	enumVals: [],
	index: 0,
	min: 0,
	max: 1,
	meta: "",
	name: "name",
	normalizedValue: 0,
	path: "",
	type: "f",
	value: 0,
	waitingForMidiMapping: false,
	isMidiMapped: false
}) {

	public static arrayFromDescription(desc: OSCQueryRNBOInstanceParameterInfo, name?: string): ParameterRecord[] {
		const result: ParameterRecord[] = [];
		if (typeof desc.VALUE !== "undefined") {
			const paramInfo = desc as OSCQueryRNBOInstanceParameterValue;

			// use setMeta to consolidate midi mapping detection logic
			result.push((new ParameterRecord({
				enumVals: paramInfo.RANGE?.[0]?.VALS || [],
				index: paramInfo.CONTENTS?.index?.VALUE || 0,
				min: paramInfo.RANGE?.[0]?.MIN,
				max: paramInfo.RANGE?.[0]?.MAX,
				name,
				normalizedValue: paramInfo.CONTENTS.normalized.VALUE,
				path: paramInfo.FULL_PATH,
				type: paramInfo.TYPE,
				value: paramInfo.VALUE
			})).setMeta(paramInfo.CONTENTS?.meta.VALUE || ""));
		} else {
			// Polyphonic params
			for (const [subParamName, subDesc] of Object.entries(desc.CONTENTS) as Array<[string, OSCQueryRNBOInstanceParameterInfo]>) {
				const subPrefix = name ? `${name}/${subParamName}` : subParamName;
				result.push(...this.arrayFromDescription(subDesc, subPrefix));
			}
		}
		return result;
	}

	public get id(): string {
		return this.name;
	}

	public get isEnum(): boolean {
		return this.enumVals.length >= 1;
	}

	public getValueForNormalizedValue(nv: number): string | number {
		if (this.isEnum) return this.enumVals[Math.round((this.enumVals.length - 1 ) * nv)];

		return typeof this.value !== "number" ? this.value : this.value;
	}

	public setValue(v: number): ParameterRecord {
		return this.set("value", v);
	}

	public setNormalizedValue(nv: number): ParameterRecord {
		return this.set("normalizedValue", nv);
	}

	public matchesQuery(query: string): boolean {
		return this.name.toLowerCase().includes(query);
	}

	public setMeta(value: string): ParameterRecord {
		// detect midi mapping
		let isMidiMapped = false;
		try {
			// detection simply looks for a 'midi' entry in the meta
			const j = JSON.parse(value);
			isMidiMapped = typeof j.midi === "object";
		} catch {
			// ignore
		}
		return this.set("meta", value).set("isMidiMapped", isMidiMapped);
	}

	public setWatingForMidiMapping(value: boolean): ParameterRecord {
		return this.set("waitingForMidiMapping", value);
	}
}
