import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOPatcher } from "../lib/types";

export const UNLOAD_PATCHER_NAME = "<none>";

export type PatcherRecordProps = {
	name: string;
	io: [number, number, number, number];
}

export class PatcherRecord extends ImmuRecord<PatcherRecordProps>({

	name: "",
	io: [0, 0, 0, 0]

}) {

	static fromDescription(name: string, desc: OSCQueryRNBOPatcher): PatcherRecord {
		return new PatcherRecord({
			name,
			io: desc.CONTENTS.io.VALUE
		});
	}

	get audioInCount(): number {
		return this.io[0] || 0;
	}

	get audioOutCount(): number {
		return this.io[1] || 0;
	}

	get midiInCount(): number {
		return this.io[2] || 0;
	}

	get midiOutCount(): number {
		return this.io[3] || 0;
	}

	get id(): string {
		return this.name;
	}
}
