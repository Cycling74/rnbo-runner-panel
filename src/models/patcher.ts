import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOPatcher } from "../lib/types";
import { dayjs } from "../lib/util";
import { Dayjs } from "dayjs";

export const UNLOAD_PATCHER_NAME = "<none>";

export type PatcherExportRecordProps = {
	createdAt: Dayjs;
	name: string;
	io: [number, number, number, number];
}

export class PatcherExportRecord extends ImmuRecord<PatcherExportRecordProps>({

	createdAt: dayjs(),
	name: "",
	io: [0, 0, 0, 0]

}) {

	static fromDescription(name: string, desc: OSCQueryRNBOPatcher): PatcherExportRecord {
		return new PatcherExportRecord({
			createdAt: dayjs(desc.CONTENTS.created_at?.VALUE, "YYYY-MM-DD HH:mm:ss"),
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

	public matchesQuery(query: string): boolean {
		return !query.length || this.name.toLowerCase().includes(query);
	}
}
