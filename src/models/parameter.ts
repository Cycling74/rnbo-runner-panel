import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstanceParameterInfo, OSCQueryRNBOInstanceParameterValue, ParameterMetaJsonMap } from "../lib/types";
import { parseMetaJSONString } from "../lib/util";

export type ParameterRecordProps = {

	enumVals: Array<string | number>;
	index: number;
	instanceIndex: number;
	min: number;
	max: number;
	meta: ParameterMetaJsonMap;
	metaString: string;
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
	instanceIndex: 0,
	min: 0,
	max: 1,
	meta: {},
	metaString: "",
	name: "name",
	normalizedValue: 0,
	path: "",
	type: "f",
	value: 0,
	waitingForMidiMapping: false,
	isMidiMapped: false
}) {

	private static arrayFromDescription(
		instanceIndex: number,
		desc: OSCQueryRNBOInstanceParameterInfo,
		name?: string
	): ParameterRecord[] {
		const result: ParameterRecord[] = [];
		if (typeof desc.VALUE !== "undefined") {
			const paramInfo = desc as OSCQueryRNBOInstanceParameterValue;

			// use setMeta to consolidate midi mapping detection logic
			result.push((new ParameterRecord({
				enumVals: paramInfo.RANGE?.[0]?.VALS || [],
				index: paramInfo.CONTENTS?.index?.VALUE || 0,
				instanceIndex,
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
				result.push(...this.arrayFromDescription(instanceIndex, subDesc, subPrefix));
			}
		}
		return result;
	}

	public static fromDescription(instanceIndex: number, paramsDesc: OSCQueryRNBOInstance["CONTENTS"]["params"]): ParameterRecord[] {
		const params: ParameterRecord[] = [];
		for (const [name, desc] of Object.entries(paramsDesc.CONTENTS || {})) {
			params.push(...ParameterRecord.arrayFromDescription(instanceIndex, desc, name));
		}
		return params;
	}

	public get id(): string {
		return this.path;
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
		let parsed: ParameterMetaJsonMap = {};
		try {
			// detection simply looks for a 'midi' entry in the meta
			parsed = parseMetaJSONString(value);
		} catch {
			// ignore
		}

		return this.withMutations(p => {
			return p
				.set("metaString", value)
				.set("meta", parsed)
				.set("isMidiMapped", typeof parsed.midi === "object");
		});
	}

	public setWaitingForMidiMapping(value: boolean): ParameterRecord {
		return this.set("waitingForMidiMapping", value);
	}
}
