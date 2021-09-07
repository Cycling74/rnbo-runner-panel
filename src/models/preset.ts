import { Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

export class PresetRecord extends ImmuRecord({

	name: "name"

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/messages/CONTENTS/in
	 * @returns An Immutable List of PresetRecord record objects
	 */
	static arrayFromDescription(desc: Array<string>): PresetRecord[] {
		if (typeof desc === "object") {
			return desc.map(name => new PresetRecord({name}));
		}

		return [];
	}

	get id(): string {
		return this.name;
	}
}
