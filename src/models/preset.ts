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
		const entries = (desc.entries.VALUE as any);
		const current = (desc.load.VALUE as string);
		console.log(current);
		if (typeof entries === "object") {
			console.log(entries);
			return entries.map(name => {
				let loaded = (name === current);
				return new PresetRecord({name, loaded})
			});
		}
		return [];
	}

	get id(): string {
		return this.name;
	}
}
