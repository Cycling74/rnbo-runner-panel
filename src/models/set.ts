import { Record as ImmuRecord } from "immutable";

export type SetRecordProps = {
	name: string;
};

export class SetRecord extends ImmuRecord<SetRecordProps>({

	name: ""

}) {

	public static fromDescription(name: string): SetRecord {
		return new SetRecord({ name });
	}

	get id(): string {
		return this.name;
	}
}
