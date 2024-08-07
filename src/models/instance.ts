import { Map as ImmuMap, Record as ImmuRecord, OrderedMap as ImmuOrderedMap } from "immutable";
import { ParameterRecord } from "./parameter";
import { PresetRecord } from "./preset";
import { DataRefRecord } from "./dataref";
import { MessagePortRecord } from "./messageport";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstanceMessages, OSCQueryRNBOInstanceMessageInfo, OSCQueryRNBOInstanceMessageValue, OSCQueryRNBOInstancePresetEntries } from "../lib/types";

export type InstanceStateProps = {
	index: number;
	patcher: string;
	path: string;
	name: string;

	presetInitial: string;
	presetLatest: string;

	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	presets: ImmuOrderedMap<PresetRecord["id"], PresetRecord>;
	datarefs: ImmuOrderedMap<DataRefRecord["id"], DataRefRecord>;

	waitingForMidiMapping: boolean;
}

const collator = new Intl.Collator("en-US");

function sortPresets(left: PresetRecord, right: PresetRecord) : number {
	if (left.initial) {
		return -1;
	}
	if (right.initial) {
		return 1;
	}
	return collator.compare(left.name, right.name);
}

export class InstanceStateRecord extends ImmuRecord<InstanceStateProps>({

	index: 0,
	name: "",
	patcher: "",
	path: "",
	presetInitial: "",
	presetLatest: "",

	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	datarefs: ImmuMap<DataRefRecord["id"], DataRefRecord>(),

	waitingForMidiMapping: false

}) {

	public get id(): string {
		return this.name;
	}

	public setMessageOutportValue(id: string, value: string): InstanceStateRecord {
		const p = this.messageOutports.get(id);
		if (!p) return this;

		return this.set("messageOutports", this.messageOutports.set(p.id, p.setValue(value)));
	}

	public setMessageOutportMeta(id: MessagePortRecord["id"], value: string): InstanceStateRecord {
		const p = this.messageOutports.get(id);
		if (!p) return this;
		return this.set("messageOutports", this.messageOutports.set(p.id, p.setMeta(value)));
	}

	public setMessageInportMeta(id: MessagePortRecord["id"], value: string): InstanceStateRecord {
		const p = this.messageInports.get(id);
		if (!p) return this;
		return this.set("messageInports", this.messageInports.set(p.id, p.setMeta(value)));
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

	public setWaitingForMapping(value: boolean): InstanceStateRecord {
		return this.set("waitingForMidiMapping", value).clearParametersWaitingForMidiMapping();
	}

	public clearParametersWaitingForMidiMapping(): InstanceStateRecord {
		return this.set("parameters", this.parameters.map(p => p.setWaitingForMidiMapping(false)));
	}

	public setParameterWaitingForMidiMapping(id: ParameterRecord["id"]): InstanceStateRecord {
		return this.set("parameters", this.parameters.map(p => p.setWaitingForMidiMapping(p.id === id)));
	}

	public setParameterNormalizedValue(id: ParameterRecord["id"], value: number): InstanceStateRecord {
		const param = this.parameters.get(id);
		if (!param) return this;

		return this.set("parameters", this.parameters.set(param.id, param.setNormalizedValue(value)));
	}

	public setParameterMeta(id: ParameterRecord["id"], value: string): InstanceStateRecord {
		const param = this.parameters.get(id);
		if (!param) return this;
		return this.set("parameters", this.parameters.set(param.id, param.setMeta(value)));
	}

	public static presetsFromDescription(entries: OSCQueryRNBOInstancePresetEntries, latest: string, initial: string): ImmuMap<PresetRecord["id"], PresetRecord> {
		return ImmuOrderedMap<PresetRecord["id"], PresetRecord>().withMutations((map) => {
			for (const name of entries.VALUE) {
				const pr = PresetRecord.fromDescription(name, name === initial, name === latest);
				map.set(pr.id, pr);
			}
		}).sort(sortPresets);
	}

	public setPresetLatest(latest: string): InstanceStateRecord {
		return this.set("presets", this.presets.map(preset => preset.setLatest(preset.name === latest))).set("presetLatest", latest);
	}

	public setPresetInitial(initial: string): InstanceStateRecord {
		return this.set("presetInitial", initial).set("presets", this.presets.map(preset => preset.setInitial(preset.name === initial)).sort(sortPresets));
	}

	public updatePresets(entries: OSCQueryRNBOInstancePresetEntries): InstanceStateRecord {
		return this.set("presets", InstanceStateRecord.presetsFromDescription(entries, this.presetLatest, this.presetInitial));
	}

	private static messagesArrayFromDescription(desc: OSCQueryRNBOInstanceMessageInfo, name: string): MessagePortRecord[] {
		if (typeof desc.VALUE !== "undefined") {
			return [MessagePortRecord.fromDescription(name, desc as OSCQueryRNBOInstanceMessageValue)];
		}

		const result: MessagePortRecord[] = [];
		for (const [subKey, subDesc] of Object.entries(desc.CONTENTS)) {
			const subPrefix = name ? `${name}/${subKey}` : subKey;
			result.push(...this.messagesArrayFromDescription(subDesc, subPrefix));
		}
		return result;
	}

	public static messagesFromDescription(messagesDesc?: OSCQueryRNBOInstanceMessages): ImmuMap<MessagePortRecord["id"], MessagePortRecord> {
		return ImmuMap<MessagePortRecord["id"], MessagePortRecord>().withMutations((map) => {
			for (const [name, desc] of Object.entries(messagesDesc?.CONTENTS || {})) {
				const ports = this.messagesArrayFromDescription(desc, name);
				ports.forEach(n => map.set(n.id, n));
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
			messageInports: this.messagesFromDescription(desc.CONTENTS.messages?.CONTENTS?.in),
			messageOutports: this.messagesFromDescription(desc.CONTENTS.messages?.CONTENTS?.out),
			parameters: this.parametersFromDescription(desc.CONTENTS.params),
			presets: this.presetsFromDescription(desc.CONTENTS.presets.CONTENTS.entries, latestPreset, initialPreset),
			datarefs: this.datarefsFromDescription(desc.CONTENTS.data_refs)
		});
	}
}
