import { Map as ImmuMap, Record as ImmuRecord, OrderedMap as ImmuOrderedMap } from "immutable";
import { PresetRecord } from "./preset";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries } from "../lib/types";

export type PatcherInstanceProps = {
	id: string;
	patcher: string;
	path: string;

	alias: string;
	jackName: string;

	presetInitial: string;
	presetLatest: string;

	presets: ImmuOrderedMap<PresetRecord["id"], PresetRecord>;

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

export class PatcherInstanceRecord extends ImmuRecord<PatcherInstanceProps>({

	alias: "", // user defined name overwrite
	id: "0",
	jackName: "", // runner assigned name
	patcher: "",
	path: "",
	presetInitial: "",
	presetLatest: "",
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),

	waitingForMidiMapping: false

}) {

	public get displayName(): string {
		return this.alias || this.jackName;
	}

	public setWaitingForMapping(value: boolean): PatcherInstanceRecord {
		return this.set("waitingForMidiMapping", value);
	}

	public setAlias(alias: string): PatcherInstanceRecord {
		return this.set("alias", alias);
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

	public static fromDescription(desc: OSCQueryRNBOInstance): PatcherInstanceRecord {

		const initialPreset: string = desc.CONTENTS.presets.CONTENTS?.initial?.VALUE || "";
		const latestPreset: string = desc.CONTENTS.presets.CONTENTS?.loaded?.VALUE || "";

		return new PatcherInstanceRecord({
			id: desc.FULL_PATH.split("/").pop(),
			alias: desc.CONTENTS.config.CONTENTS.name_alias?.VALUE || "",
			jackName: desc.CONTENTS.jack.CONTENTS.name.VALUE,
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			presets: this.presetsFromDescription(desc.CONTENTS.presets.CONTENTS.entries, latestPreset, initialPreset)
		});
	}
}
