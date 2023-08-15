import { Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

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

		if (Array.isArray(entries)) {
			return entries.map(name => {
				return new PatcherRecord({name, loaded: loadedName === name });
			});
		}
		return [];
	}

	get id(): string {
		return this.name;
	}
}
