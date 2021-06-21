import { List, OrderedMap, Record as ImmuRecord } from "immutable";
import { JsonMap } from "../lib/types";

export class InportRecord extends ImmuRecord({

	name: "name",

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/messages/CONTENTS/in
	 * @returns An Immutable List of InportRecord record objects
	 */
	static listFromPortDescription(desc: JsonMap): List<InportRecord> {

		if (typeof desc.CONTENTS === "object") {
			const inportNames = Object.getOwnPropertyNames(desc.CONTENTS);
			return List<InportRecord>(inportNames.map(name => new InportRecord({name})));
		}

		return List<InportRecord>();
	}
}
