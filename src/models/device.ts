import { Map, Record as ImmuRecord } from "immutable";
import { AnyJson, JsonMap } from "../lib/types";

export class DeviceRecord extends ImmuRecord({

	id: "",
	name: "name"

}) {

	static fromDeviceDescription(desc: JsonMap) {
		return new DeviceRecord({
			id: (desc.id as string),
			name: (desc.name as string)
		});
	}
}
