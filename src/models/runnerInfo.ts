import { Record as ImmuRecord} from "immutable";
import { OSCQueryBooleanValue, OSCQueryFloatValue, OSCQueryIntValue, OSCQuerySingleValue, OSCQueryStringValue, OSCQueryValueType } from "../lib/types";

export enum RunnerInfoKey {
	CPULoad = "cpu_load",
	XRunCount = "xrun_count"
}

export type JackInfoRecordProps = {
	id: RunnerInfoKey;
	description: string;
	oscValue: number | string | boolean | null;
	oscType: OSCQueryValueType.String | OSCQueryValueType.True | OSCQueryValueType.False | OSCQueryValueType.Int32 | OSCQueryValueType.Float32 | OSCQueryValueType.Double64;
	path: string;
}

type RunnierInfoOSCDescType = OSCQueryStringValue | OSCQueryIntValue | OSCQueryBooleanValue | OSCQueryFloatValue;

export class RunnerInfoRecord extends ImmuRecord<JackInfoRecordProps>({
	id: RunnerInfoKey.CPULoad,
	description: "",
	oscValue: 0,
	oscType: OSCQueryValueType.Int32,
	path: ""

}) {

	public static fromDescription(id: RunnerInfoKey, desc: RunnierInfoOSCDescType): RunnerInfoRecord {
		return new RunnerInfoRecord({
			id,
			description: desc.DESCRIPTION || "",
			oscType: desc.TYPE,
			oscValue: desc.VALUE,
			path: desc.FULL_PATH || ""
		});
	}

}
