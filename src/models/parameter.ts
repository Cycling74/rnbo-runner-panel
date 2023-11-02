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

	// public static arrayFromDescription(desc: JsonMap, prefix?: string): ParameterRecord[] {

	// 	if (typeof desc.VALUE !== "undefined") {

	// 		const parameterRecord = new ParameterRecord({
	// 			name: prefix,
	// 			value: (desc.VALUE as number),
	// 			min: ((desc.RANGE as JsonMap[])[0].MIN as number),
	// 			max: ((desc.RANGE as JsonMap[])[0].MAX as number),
	// 			type: (desc.TYPE as string),
	// 			normalizedValue: (((desc.CONTENTS as JsonMap).normalized as JsonMap).VALUE as number)
	// 		});

	// 		return [parameterRecord];
	// 	}

	// 	const nextDesc = desc.CONTENTS as JsonMap;
	// 	const subparamNames = Object.getOwnPropertyNames(nextDesc);
	// 	const subparamLists = subparamNames.map(subparamName => {
	// 		const nextPrefix = prefix ? `${prefix}/${subparamName}` : subparamName;
	// 		return this.arrayFromDescription(nextDesc[subparamName] as JsonMap, nextPrefix);
	// 	});
	// 	return subparamLists.reduce((acc, l) => acc.concat(l), []);
	// }

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
