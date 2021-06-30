import { List, OrderedMap, Record as ImmuRecord } from "immutable";
import { AnyJson, JsonMap } from "../lib/types";

export class ParameterRecord extends ImmuRecord({

	name: "name",
	value: 0,
	min: 0,
	max: 1,
	type: "f",
	normalizedValue: 0

}) {

	static arrayFromDescription(desc: JsonMap, prefix?: string): ParameterRecord[] {

		if (typeof desc.VALUE !== "undefined") {

			const parameterRecord = new ParameterRecord({
				name: prefix,
				value: (desc.VALUE as number),
				min: ((desc.RANGE as JsonMap[])[0].MIN as number),
				max: ((desc.RANGE as JsonMap[])[0].MAX as number),
				type: (desc.TYPE as string),
				normalizedValue: (((desc.CONTENTS as JsonMap).normalized as JsonMap).VALUE as number),
			});

			return [parameterRecord];
		}

		const nextDesc = desc.CONTENTS;
		const subparamNames = Object.getOwnPropertyNames(nextDesc);
		const subparamLists = subparamNames.map(subparamName => {
			const nextPrefix = prefix ? `${prefix}/${subparamName}` : subparamName;
			return this.arrayFromDescription(nextDesc[subparamName] as JsonMap, nextPrefix);
		});
		return subparamLists.reduce((acc, l) => acc.concat(l), []);
	}

	setValue(v: number) {
		return this.set("value", v);
	}

	get id(): string {
		return this.name;
	}
}
