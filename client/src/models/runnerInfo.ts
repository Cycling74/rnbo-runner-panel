import { Record as ImmuRecord} from "immutable";
import { OSCQueryBooleanValue, OSCQueryFloatValue, OSCQueryIntValue, OSCQueryStringValue, OSCQueryValueType, RunnerInfoKey } from "../lib/types";
import { SystemInfoKey } from "../lib/constants";

export type RunnerInfoRecordProps = {
	id: RunnerInfoKey;
	description: string;
	oscValue: number | string | boolean | null;
	oscType: OSCQueryValueType.String | OSCQueryValueType.True | OSCQueryValueType.False | OSCQueryValueType.Int32 | OSCQueryValueType.Float32 | OSCQueryValueType.Double64;
	path: string;
}

type RunnerInfoOSCDescType = OSCQueryStringValue | OSCQueryIntValue | OSCQueryBooleanValue | OSCQueryFloatValue;

export class RunnerInfoRecord extends ImmuRecord<RunnerInfoRecordProps>({
	id: SystemInfoKey.RunnerVersion,
	description: "",
	oscValue: 0,
	oscType: OSCQueryValueType.Int32,
	path: ""

}) {

	public setValue(value: RunnerInfoRecordProps["oscValue"]): RunnerInfoRecord {
		return this.set("oscValue", value);
	}

	public static fromDescription(id: RunnerInfoKey, desc: RunnerInfoOSCDescType): RunnerInfoRecord {
		return new RunnerInfoRecord({
			id,
			description: desc.DESCRIPTION || "",
			oscType: desc.TYPE,
			oscValue: desc.VALUE,
			path: desc.FULL_PATH || ""
		});
	}

}
