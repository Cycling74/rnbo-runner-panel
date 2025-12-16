import { Record as ImmuRecord } from "immutable";

export type PresetRecordProps = {
	name: string;
	initial: boolean;
	latest: boolean;
};

export class PresetRecord extends ImmuRecord<PresetRecordProps>({

	name: "",
	initial: false,
	latest: false

}) {

	public static fromDescription(name: string, initial: boolean = false, latest: boolean = false): PresetRecord {
		return new PresetRecord({ name, initial, latest });
	}

	get id(): string {
		return this.name;
	}

	public setLatest(latest: boolean) : PresetRecord {
		return this.set("latest", latest);
	}

	public setInitial(initial: boolean) : PresetRecord {
		return this.set("initial", initial);
	}
}
