import { Record as ImmuRecord } from "immutable";

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
