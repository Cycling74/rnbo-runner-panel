import { Record as ImmuRecord } from "immutable";

export type PresetRecordProps = {
	name: string;
};

export class PresetRecord extends ImmuRecord<PresetRecordProps>({

	name: ""

}) {

	public static fromDescription(name: string): PresetRecord {
		return new PresetRecord({ name });
	}

	get id(): string {
		return this.name;
	}
}
