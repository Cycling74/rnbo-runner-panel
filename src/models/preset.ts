import { Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

export class PresetRecord extends ImmuRecord({

	name: "",
	loaded: false

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/messages/CONTENTS/in
	 * @returns An Immutable List of PresetRecord record objects
	 */
	static arrayFromDescription(desc: JsonMap): PresetRecord[] {

		const entries = ((desc.entries as JsonMap).VALUE as any);
		const current = ((desc.entries as JsonMap).VALUE as string);

		if (Array.isArray(entries)) {
			return entries.map(name => {
				return new PresetRecord({name, loaded: name === current });
			});
		}
		return [];
	}

	get id(): string {
		return this.name;
	}
}
