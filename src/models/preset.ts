import { Record as ImmuRecord } from "immutable";

export class PresetRecord extends ImmuRecord({

	name: "",
	loaded: false

}) {

	/**
	 *
	 * @param desc - JSON device description returned from OscQuery, rooted at /rnbo/inst/0/presets
	 * @returns An Immutable List of PresetRecord record objects
	 */
	static arrayFromDescription(entries?: any): PresetRecord[] {
		if (Array.isArray(entries)) {
			return entries.map(name => {
				return new PresetRecord({name, loaded: false });
			});
		}
		return [];
	}

	get id(): string {
		return this.name;
	}
}
