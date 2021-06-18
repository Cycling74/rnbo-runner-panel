import { OrderedMap, Record as ImmuRecord } from "immutable";
import { AnyJson, JsonMap } from "../lib/types";
import { ParameterRecord } from "./parameter";

let deviceSequence = 0;
export class DeviceRecord extends ImmuRecord({

	id: "",
	parameters: OrderedMap<string, ParameterRecord>()

}) {

	static fromDeviceDescription(desc: JsonMap) {
		let parameterDescriptions = {};
		try {
			parameterDescriptions = ((desc.CONTENTS as JsonMap).params as JsonMap);
		} catch (e) {}

		return new DeviceRecord({
			id: `${++deviceSequence}`,
			parameters: ParameterRecord.mapFromParamDescription(parameterDescriptions)
		});
	}
}
