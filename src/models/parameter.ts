import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceParameterInfo, OSCQueryRNBOInstanceParameterValue } from "../lib/types";

export type ParameterRecordProps = {
	enumVals: Array<string | number>;
	min: number;
	max: number;
	name: string;
	normalizedValue: number;
	path: string;
	type: string;
	value: string | number;
}
export class ParameterRecord extends ImmuRecord<ParameterRecordProps>({

	enumVals: [],
	min: 0,
	max: 1,
	name: "name",
	normalizedValue: 0,
	path: "",
	type: "f",
	value: 0

}) {

	public static arrayFromDescription(desc: OSCQueryRNBOInstanceParameterInfo, name?: string): ParameterRecord[] {
		const result: ParameterRecord[] = [];
		if (typeof desc.VALUE !== "undefined") {
			const paramInfo = desc as OSCQueryRNBOInstanceParameterValue;
			result.push(new ParameterRecord({
				enumVals: paramInfo.RANGE?.[0]?.VALS || [],
				min: paramInfo.RANGE?.[0]?.MIN,
				max: paramInfo.RANGE?.[0]?.MAX,
				name,
				normalizedValue: paramInfo.CONTENTS.normalized.VALUE,
				path: paramInfo.FULL_PATH,
				type: paramInfo.TYPE,
				value: paramInfo.VALUE
			}));
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
}
