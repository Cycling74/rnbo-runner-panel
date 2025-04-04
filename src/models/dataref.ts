import { Record as ImmuRecord } from "immutable";
import { DataRefMetaJsonMap, OSCQueryRNBOInstanceDataRefs } from "../lib/types";
import { parseMetaJSONString } from "../lib/util";
import { PatcherInstanceRecord } from "./instance";

export type DataRefRecordProps = {
	instanceId: PatcherInstanceRecord["id"];
	meta: DataRefMetaJsonMap;
	metaString: string;
	name: string;
	path: string;
	value: string;
};

export class DataRefRecord extends ImmuRecord<DataRefRecordProps>({
	instanceId: "",
	meta: {},
	metaString: "",
	name: "",
	path: "",
	value: ""
}) {

	public get id(): string {
		return this.path;
	}

	public setValue(v: string) : DataRefRecord {
		return this.set("value", v);
	}

	public setMeta(value: string): DataRefRecord {
		// detect midi mapping
		let parsed: DataRefMetaJsonMap = {};
		try {
			// detection simply looks for a 'midi' entry in the meta
			parsed = parseMetaJSONString(value);
		} catch {
			// ignore
		}

		return this.withMutations(p => {
			return p
				.set("metaString", value)
				.set("meta", parsed);
		});
	}

	public static fromDescription(
		instanceId: PatcherInstanceRecord["id"],
		datarefDesc: OSCQueryRNBOInstanceDataRefs
	): DataRefRecord[] {
		const refs: DataRefRecord[] = [];
		for (const [name, desc] of Object.entries(datarefDesc?.CONTENTS || {})) {
			refs.push(
				new DataRefRecord({
					instanceId,
					name,
					path: desc.FULL_PATH,
					value: desc.VALUE || ""
				}).setMeta(desc.CONTENTS?.meta?.VALUE || "")
			);
		}
		return refs;
	}
}
