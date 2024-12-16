import { Map as ImmuMap, Record as ImmuRecord, OrderedMap as ImmuOrderedMap } from "immutable";
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

export class PatcherInstanceRecord extends ImmuRecord<InstanceStateProps>({

	index: 0,
	name: "",
	patcher: "",
	path: "",
	presetInitial: "",
	presetLatest: "",
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	datarefs: ImmuMap<DataRefRecord["id"], DataRefRecord>(),

	waitingForMidiMapping: false

}) {

	public get id(): string {
		return this.name;
	}

	public setWaitingForMapping(value: boolean): PatcherInstanceRecord {
		return this.set("waitingForMidiMapping", value);
	}

	public setDataRefValue(id: string, fileId: string): PatcherInstanceRecord {
		const dataref = this.datarefs.get(id);
		if (!dataref) return this;

		return this.set("datarefs", this.datarefs.set(dataref.id, dataref.setFileId(fileId)));
	}

	public static presetsFromDescription(entries: OSCQueryRNBOInstancePresetEntries, latest: string, initial: string): ImmuMap<PresetRecord["id"], PresetRecord> {
		return ImmuOrderedMap<PresetRecord["id"], PresetRecord>().withMutations((map) => {
			for (const name of entries.VALUE) {
				const pr = PresetRecord.fromDescription(name, name === initial, name === latest);
				map.set(pr.id, pr);
			}
		}).sort(sortPresets);
	}

	public setPresetLatest(latest: string): PatcherInstanceRecord {
		return this.set("presets", this.presets.map(preset => preset.setLatest(preset.name === latest))).set("presetLatest", latest);
	}

	public setPresetInitial(initial: string): PatcherInstanceRecord {
		return this.set("presetInitial", initial).set("presets", this.presets.map(preset => preset.setInitial(preset.name === initial)).sort(sortPresets));
	}

	public updatePresets(entries: OSCQueryRNBOInstancePresetEntries): PatcherInstanceRecord {
		return this.set("presets", PatcherInstanceRecord.presetsFromDescription(entries, this.presetLatest, this.presetInitial));
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

	public static fromDescription(desc: OSCQueryRNBOInstance): PatcherInstanceRecord {

		const initialPreset: string = desc.CONTENTS.presets.CONTENTS?.initial?.VALUE || "";
		const latestPreset: string = desc.CONTENTS.presets.CONTENTS?.loaded?.VALUE || "";

		return new PatcherInstanceRecord({
			index: parseInt(desc.FULL_PATH.split("/").pop(), 10),
			name: this.getJackName(desc.CONTENTS.jack),
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			presets: this.presetsFromDescription(desc.CONTENTS.presets.CONTENTS.entries, latestPreset, initialPreset),
			datarefs: this.datarefsFromDescription(desc.CONTENTS.data_refs)
		});
	}
}
