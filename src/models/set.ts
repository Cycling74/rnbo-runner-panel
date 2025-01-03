import { Record as ImmuRecord } from "immutable";

export type GraphSetRecordProps = {
	initial: boolean;
	name: string;
	latest: boolean;
};

export class GraphSetRecord extends ImmuRecord<GraphSetRecordProps>({
	initial: false,
	name: "",
	latest: false
}) {

	public static fromDescription(name: string, initial: boolean = false, latest: boolean = false): GraphSetRecord {
		return new GraphSetRecord({ name, initial, latest });
	}

	get id(): string {
		return this.name;
	}

	public setInitial(initial: boolean) : GraphSetRecord {
		return this.set("initial", initial);
	}

	public setLatest(latest: boolean) : GraphSetRecord {
		return this.set("latest", latest);
	}
}
