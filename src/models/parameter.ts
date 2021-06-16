import { Map, Record as ImmuRecord } from "immutable";
import { AnyJson, JsonMap } from "../lib/types";

export class ParameterRecord extends ImmuRecord({

	id: "",
	name: "name",
	value: 0,
	min: 0,
	max: 1,
	exponent: 1,
	unit: "float"

}) {

	static fromParameterDescription(desc: JsonMap) {
		return new ParameterRecord({
			id: (desc.id as string),
			name: (desc.name as string),
			value: (desc.value as number),
			min: (desc.min as number),
			max: (desc.max as number),
			exponent: (desc.exponent as number),
			unit: (desc.unit as string)
		});
	}

	setValue(v: number) {
		return this.set("value", v);
	}
}
