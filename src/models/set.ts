import { Record as ImmuRecord } from "immutable";

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
