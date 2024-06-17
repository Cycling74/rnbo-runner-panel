import { Record as ImmuRecord} from "immutable";
import { OSCQueryBooleanValue, OSCQueryFloatValue, OSCQueryIntValue, OSCQueryStringValue, OSCQueryValueType } from "../lib/types";

export enum RunnerInfoKey {
	CPULoad = "cpu_load",
	XRunCount = "xrun_count",
	RunnerVersion = "version"
}

export const JackInfoKeys: (RunnerInfoKey.CPULoad | RunnerInfoKey.XRunCount)[] = [RunnerInfoKey.CPULoad, RunnerInfoKey.XRunCount];

export type RunnerInfoRecordProps = {
	id: RunnerInfoKey;
	description: string;
	oscValue: number | string | boolean | null;
	oscType: OSCQueryValueType.String | OSCQueryValueType.True | OSCQueryValueType.False | OSCQueryValueType.Int32 | OSCQueryValueType.Float32 | OSCQueryValueType.Double64;
	path: string;
}

type RunnerInfoOSCDescType = OSCQueryStringValue | OSCQueryIntValue | OSCQueryBooleanValue | OSCQueryFloatValue;

export class RunnerInfoRecord extends ImmuRecord<RunnerInfoRecordProps>({
	id: RunnerInfoKey.CPULoad,
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
