import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceParameter } from "../lib/types";

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

	public static fromDescription(name: string, desc: OSCQueryRNBOInstanceParameter): ParameterRecord {
		return new ParameterRecord({
			min: desc.RANGE?.[0]?.MIN,
			max: desc.RANGE?.[0]?.MAX,
			name,
			normalizedValue: desc.CONTENTS.normalized.VALUE,
			path: desc.FULL_PATH,
			type: desc.TYPE,
			value: desc.VALUE
		});
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
