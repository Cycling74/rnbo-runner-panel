import { Map as ImmuMap, Record as ImmuRecord, OrderedMap as ImmuOrderedMap } from "immutable";
import { ParameterRecord } from "./parameter";
import { PresetRecord } from "./preset";
import { DataRefRecord } from "./dataref";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries } from "../lib/types";

export type InstanceStateProps = {
	index: number;
	patcher: string;
	path: string;
	name: string;

	presetInitial: string;
	presetLatest: string;

	messageInputs: ImmuMap<string, string>;
	messageOutputs: ImmuMap<string, string>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	presets: ImmuOrderedMap<PresetRecord["id"], PresetRecord>;
	datarefs: ImmuOrderedMap<DataRefRecord["id"], DataRefRecord>;
}

const collator = new Intl.Collator("en-US");

export class InstanceStateRecord extends ImmuRecord<InstanceStateProps>({

	index: 0,
	name: "",
	patcher: "",
	path: "",
	presetInitial: "",
	presetLatest: "",

	messageInputs: ImmuMap<string, string>(),
	messageOutputs: ImmuMap<string, string>(),
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	datarefs: ImmuMap<DataRefRecord["id"], DataRefRecord>()

}) {

	public get id(): string {
		return this.name;
	}

	public setMessageOutportValue(id: string, value: string): InstanceStateRecord {
		return this.set("messageOutputs", this.messageOutputs.set(id, value));
	}

	public setDataRefValue(id: string, fileId: string): InstanceStateRecord {
		const dataref = this.datarefs.get(id);
		if (!dataref) return this;

		return this.set("datarefs", this.datarefs.set(dataref.id, dataref.setFileId(fileId)));
	}

	public setParameterValue(id: ParameterRecord["id"], value: number): InstanceStateRecord {
		const param = this.parameters.get(id);
		if (!param) return this;

		return this.set("parameters", this.parameters.set(param.id, param.setValue(value)));
	}

	public setParameterNormalizedValue(id: ParameterRecord["id"], value: number): InstanceStateRecord {
		const param = this.parameters.get(id);
		if (!param) return this;

		return this.set("parameters", this.parameters.set(param.id, param.setNormalizedValue(value)));
	}

	public static presetsFromDescription(entries: OSCQueryRNBOInstancePresetEntries, latest: string, initial: string): ImmuMap<PresetRecord["id"], PresetRecord> {
		return ImmuOrderedMap<PresetRecord["id"], PresetRecord>().withMutations((map) => {
			for (const name of entries.VALUE) {
				const pr = PresetRecord.fromDescription(name, name === initial, name === latest);
				map.set(pr.id, pr);
			}
		}).sort((left: PresetRecord, right: PresetRecord) => {
			if (left.initial)
			{return -1;}
			if (right.initial)
			{return 1;}
			return collator.compare(left.name, right.name);
		});
	}

	public setPresetLatest(latest: string): InstanceStateRecord {
		return this.set("presets", this.presets.map(preset => preset.setLatest(preset.name === latest))).set("presetLatest", latest);
	}

	public setPresetInitial(initial: string): InstanceStateRecord {
		return this.set("presets", this.presets.map(preset => preset.setInitial(preset.name === initial))).set("presetInitial", initial);
	}

	public updatePresets(entries: OSCQueryRNBOInstancePresetEntries): InstanceStateRecord {
		return this.set("presets", InstanceStateRecord.presetsFromDescription(entries, this.presetLatest, this.presetInitial));
	}

	public static messageInputsFromDescription(messagesDesc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): ImmuMap<string, string> {
		return ImmuMap<string, string>().withMutations((map) => {
			for (const name of Object.keys(messagesDesc?.CONTENTS?.in?.CONTENTS || {})) {
				map.set(name, "");
			}
		});
	}

	public static messageOutputsFromDescription(messagesDesc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): ImmuMap<string, string> {
		return ImmuMap<string, string>().withMutations((map) => {
			for (const name of Object.keys(messagesDesc?.CONTENTS?.out?.CONTENTS || {})) {
				map.set(name, "");
			}
		});
	}

	public static parametersFromDescription(paramsDesc: OSCQueryRNBOInstance["CONTENTS"]["params"]): ImmuMap<ParameterRecord["id"], ParameterRecord> {
		return ImmuMap<ParameterRecord["id"], ParameterRecord>().withMutations((map) => {
			for (const [name, desc] of Object.entries(paramsDesc.CONTENTS || {})) {
				const params = ParameterRecord.arrayFromDescription(desc, name);
				params.forEach(pr => map.set(pr.id, pr));
			}
		});
	}

	public static datarefsFromDescription(datarefsDesc: OSCQueryRNBOInstance["CONTENTS"]["data_refs"]): ImmuMap<DataRefRecord["id"], DataRefRecord> {
		return ImmuMap<DataRefRecord["id"], DataRefRecord>().withMutations((map) => {
			for (const [name, desc] of Object.entries(datarefsDesc.CONTENTS || {})) {
				const dataref = DataRefRecord.fromDescription(name, desc.VALUE);
				map.set(dataref.id, dataref);
			}
		});
	}

	public static getJackName(desc: OSCQueryRNBOInstance["CONTENTS"]["jack"]): string {
		return desc.CONTENTS.name.VALUE as string;
	}

	public static fromDescription(desc: OSCQueryRNBOInstance): InstanceStateRecord {

		const initialPreset: string = desc.CONTENTS.presets.CONTENTS?.initial?.VALUE || "";
		const latestPreset: string = desc.CONTENTS.presets.CONTENTS?.loaded?.VALUE || "";

		return new InstanceStateRecord({
			index: parseInt(desc.FULL_PATH.split("/").pop(), 10),
			name: this.getJackName(desc.CONTENTS.jack),
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			messageInputs: this.messageInputsFromDescription(desc.CONTENTS.messages),
			messageOutputs: this.messageOutputsFromDescription(desc.CONTENTS.messages),
			parameters: this.parametersFromDescription(desc.CONTENTS.params),
			presets: this.presetsFromDescription(desc.CONTENTS.presets.CONTENTS.entries, latestPreset, initialPreset),
			datarefs: this.datarefsFromDescription(desc.CONTENTS.data_refs)
		});
	}
}
