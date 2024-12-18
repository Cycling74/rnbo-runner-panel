import { Record as ImmuRecord, List as ImmuList } from "immutable";
import { OSCQueryRNBOSetView } from "../lib/types";
import { PatcherInstanceRecord } from "./instance";
import { ParameterRecord } from "./parameter";

export type GraphSetRecordProps = {
	name: string;
	latest: boolean;
};

export class GraphSetRecord extends ImmuRecord<GraphSetRecordProps>({
	name: "",
	latest: false
}) {

	public static fromDescription(name: string): GraphSetRecord {
		return new GraphSetRecord({ name });
	}

	get id(): string {
		return this.name;
	}

	public setLatest(latest: boolean) : GraphSetRecord {
		return this.set("latest", latest);
	}
}

export type GraphSetViewParameterEntry = {
	instanceIndex: PatcherInstanceRecord["index"];
	paramIndex: ParameterRecord["index"];
}

export type GraphSetViewRecordProps = {
	id: string;
	name: string;
	params: ImmuList<GraphSetViewParameterEntry>;
	sortOrder: number;
};

export class GraphSetViewRecord extends ImmuRecord<GraphSetViewRecordProps>({
	id: "0",
	name: "",
	params: ImmuList<GraphSetViewParameterEntry>(),
	sortOrder: 0
}) {

	private static getParamListFromDesc(params: string[]): ImmuList<GraphSetViewParameterEntry> {
		return ImmuList<GraphSetViewParameterEntry>().withMutations(list => {
			for (const p of params) {
				const [iIndex, pIndex]= p.split(":");

				const instanceIndex = parseInt(iIndex, 10);
				const paramIndex = parseInt(pIndex, 10);
				if (!isNaN(instanceIndex) && !isNaN(paramIndex)) {
					list.push({ instanceIndex, paramIndex });
				}
			}
		});
	}

	public static getEmptyRecord(id: string): GraphSetViewRecord {
		return new GraphSetViewRecord({
			id,
			name: "",
			params: ImmuList<GraphSetViewParameterEntry>(),
			sortOrder: 0
		});
	}

	public static fromDescription(id: string, desc: OSCQueryRNBOSetView): GraphSetViewRecord {
		return new GraphSetViewRecord({
			id,
			name: desc.CONTENTS.name.VALUE,
			params: this.getParamListFromDesc(desc.CONTENTS.params.VALUE),
			sortOrder: desc.CONTENTS.sort_order.VALUE
		});
	}

	public setName(name: string): GraphSetViewRecord {
		return this.set("name", name);
	}

	public setParams(params: string[]): GraphSetViewRecord {
		const list = GraphSetViewRecord.getParamListFromDesc(params);
		return this.set("params", list);
	}

	public setSortOrder(sortOrder: number): GraphSetViewRecord {
		return this.set("sortOrder", sortOrder);
	}

}
