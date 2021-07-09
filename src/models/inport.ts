import { Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

export class InportRecord extends ImmuRecord({

	name: "name"

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/messages/CONTENTS/in
	 * @returns An Immutable List of InportRecord record objects
	 */
	static arrayFromDescription(desc: JsonMap): InportRecord[] {

		if (typeof desc.CONTENTS === "object") {
			const inportNames = Object.getOwnPropertyNames(desc.CONTENTS);
			return inportNames.map(name => new InportRecord({name}));
		}

		return [];
	}

	get id(): string {
		return this.name;
	}
}
