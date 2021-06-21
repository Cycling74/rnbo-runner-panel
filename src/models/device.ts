import { OrderedMap, List, Record as ImmuRecord } from "immutable";
import { AnyJson, JsonMap } from "../lib/types";
import { InportRecord } from "./inport";
import { ParameterRecord } from "./parameter";

let deviceSequence = 0;
export class DeviceRecord extends ImmuRecord({

	id: "",
	parameters: OrderedMap<string, ParameterRecord>(),
	inports: List<InportRecord>(),

}) {

	static fromDeviceDescription(desc: JsonMap) {
		let parameterDescriptions = {};
		let inportDescriptions = {};
		try {
			parameterDescriptions = (desc as any).CONTENTS.params;
			inportDescriptions = (desc as any).CONTENTS.messages.CONTENTS.in;
		} catch (e) {}

		return new DeviceRecord({
			id: `${++deviceSequence}`,
			parameters: ParameterRecord.mapFromParamDescription(parameterDescriptions),
			inports: InportRecord.listFromPortDescription(inportDescriptions)
		});
	}
}
