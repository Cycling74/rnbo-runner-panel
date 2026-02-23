import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstanceParameterInfo, OSCQueryRNBOInstanceParameterValue, ParameterMetaJsonMap } from "../lib/types";
import { instanceAndParamIndicesToSetViewEntry, parseMetaJSONString, midiMappingFromMeta } from "../lib/util";
import { MIDIMetaMappingType } from "../lib/constants";


export type ParameterRecordProps = {

	displayName: string;
	enumVals: Array<string | number>;
	index: number;
	instanceId: string;
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
	midiMappingType: false | MIDIMetaMappingType;
	isMidiMapped: boolean;
}
export class ParameterRecord extends ImmuRecord<ParameterRecordProps>({

	displayName: "",
	enumVals: [],
	index: 0,
	instanceId: "0",
	min: 0,
	max: 1,
	meta: {},
	metaString: "",
	name: "",
	normalizedValue: 0,
	path: "",
	type: "f",
	value: 0,
	waitingForMidiMapping: false,
	isMidiMapped: false,
	midiMappingType: false
}) {

	private static arrayFromDescription(
		instanceId: string,
		desc: OSCQueryRNBOInstanceParameterInfo,
		name?: string
	): ParameterRecord[] {
		const result: ParameterRecord[] = [];
		if (typeof desc.VALUE !== "undefined") {
			const paramInfo = desc as OSCQueryRNBOInstanceParameterValue;

			// use setMeta to consolidate midi mapping detection logic
			result.push((new ParameterRecord({
				displayName: paramInfo.CONTENTS.display_name?.VALUE || "",
				enumVals: paramInfo.RANGE?.[0]?.VALS || [],
				index: paramInfo.CONTENTS?.index?.VALUE || 0,
				instanceId,
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
				result.push(...this.arrayFromDescription(instanceId, subDesc, subPrefix));
			}
		}
		return result;
	}

	public static fromDescription(instanceId: string, paramsDesc: OSCQueryRNBOInstance["CONTENTS"]["params"]): ParameterRecord[] {
		const params: ParameterRecord[] = [];
		for (const [name, desc] of Object.entries(paramsDesc.CONTENTS || {})) {
			params.push(...ParameterRecord.arrayFromDescription(instanceId, desc, name));
		}
		return params;
	}

	public get id(): string {
		return this.path;
	}

	public get isEnum(): boolean {
		return this.enumVals.length >= 1;
	}

	public get label(): string {
		return this.displayName || this.name;
	}

	public get setViewId(): string {
		return instanceAndParamIndicesToSetViewEntry(this.instanceId, this.name);
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
		return this.displayName.toLowerCase().includes(query) || this.name.toLowerCase().includes(query);
	}

	public setDisplayName(value: string): ParameterRecord {
		return this.set("displayName", value || "");
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

		const { isMidiMapped, midiMappingType } = midiMappingFromMeta(parsed);

		return this.withMutations(p => {
			return p
				.set("metaString", value)
				.set("meta", parsed)
				.set("isMidiMapped", isMidiMapped)
				.set("midiMappingType", midiMappingType);
		});
	}

	public setWaitingForMidiMapping(value: boolean): ParameterRecord {
		return this.set("waitingForMidiMapping", value);
	}
}
