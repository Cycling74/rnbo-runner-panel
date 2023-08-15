import { Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

export const UNLOAD_PATCHER_NAME = "<none>";

export class PatcherRecord extends ImmuRecord({

	name: "",
	loaded: false

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/messages/CONTENTS/in
	 * @returns An Immutable List of PatcherRecord record objects
	 */
	static arrayFromDescription(desc: JsonMap, loadedName?: string): PatcherRecord[] {

		const entries = Object.keys(desc);

		let records: PatcherRecord[] = [new PatcherRecord({ name: UNLOAD_PATCHER_NAME, loaded: true })];

		if (Array.isArray(entries)) {
			records = records.concat(entries.map(name => {
				return new PatcherRecord({name, loaded: loadedName === name });
			}));
		}
		return records;
	}

	get id(): string {
		return this.name;
	}
}
