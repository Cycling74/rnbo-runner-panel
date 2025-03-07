import { Record as ImmuRecord, List as ImmuList, OrderedSet as ImmuOrderedSet } from "immutable";
import { OSCQueryRNBOSetView } from "../lib/types";
import { PatcherInstanceRecord } from "./instance";
import { ParameterRecord } from "./parameter";

export type GraphSetRecordProps = {
	name: string;
};

export class GraphSetRecord extends ImmuRecord<GraphSetRecordProps>({
	name: ""
}) {

	public static fromDescription(name: string): GraphSetRecord {
		return new GraphSetRecord({ name });
	}

	get id(): string {
		return this.name;
	}
}

export type GraphSetViewParameterEntry = {
	instanceId: PatcherInstanceRecord["id"];
	paramIndex: ParameterRecord["index"];
}

export type GraphSetViewRecordProps = {
	id: number;
	name: string;
	params: ImmuList<GraphSetViewParameterEntry>;
	paramIds:  ImmuOrderedSet<string>;
};

export class GraphSetViewRecord extends ImmuRecord<GraphSetViewRecordProps>({
	id: 0,
	name: "",
	params: ImmuList<GraphSetViewParameterEntry>(),
	paramIds: ImmuOrderedSet<string>()
}) {

	private static getParamListFromDesc(params: string[]): ImmuList<GraphSetViewParameterEntry> {
		return ImmuList<GraphSetViewParameterEntry>().withMutations(list => {
			for (const p of params) {
				const [instanceId, pIndex] = p.split(":");
				const paramIndex = parseInt(pIndex, 10);
				if (instanceId.length && !isNaN(paramIndex)) {
					list.push({ instanceId, paramIndex });
				}
			}
		});
	}

	public static getEmptyRecord(id: string): GraphSetViewRecord {
		return new GraphSetViewRecord({
			id: parseInt(id, 10),
			name: "",
			params: ImmuList<GraphSetViewParameterEntry>(),
			paramIds: ImmuOrderedSet<string>()
		});
	}

	public static fromDescription(id: string, desc: OSCQueryRNBOSetView): GraphSetViewRecord {
		return new GraphSetViewRecord({
			id: parseInt(id, 10),
			name: desc.CONTENTS.name.VALUE,
			paramIds: ImmuOrderedSet<string>(desc.CONTENTS.params.VALUE || []),
			params: this.getParamListFromDesc(desc.CONTENTS.params.VALUE)
		});
	}

	public get instanceIds(): ImmuOrderedSet<GraphSetViewParameterEntry["instanceId"]> {
		return ImmuOrderedSet<GraphSetViewParameterEntry["instanceId"]>()
			.withMutations(set => {
				this.params.forEach(p => set.add(p.instanceId));
			});
	}

	public setName(name: string): GraphSetViewRecord {
		return this.set("name", name);
	}

	public setParams(params: string[]): GraphSetViewRecord {
		const list = GraphSetViewRecord.getParamListFromDesc(params);
		return this
			.set("params", list)
			.set("paramIds", ImmuOrderedSet<string>(params));
	}
}
