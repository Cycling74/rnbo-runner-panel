import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceParameterInfo, OSCQueryRNBOInstanceParameterValue } from "../lib/types";

export type ParameterRecordProps = {
	min: number;
	max: number;
	name: string;
	normalizedValue: number;
	path: string;
	type: string;
	value: number;
}
export class ParameterRecord extends ImmuRecord<ParameterRecordProps>({

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

	public setValue(v: number): ParameterRecord {
		return this.set("value", v);
	}

	public setNormalizedValue(nv: number): ParameterRecord {
		return this.set("normalizedValue", nv);
	}
}
