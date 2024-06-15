import { Record as ImmuRecord } from "immutable";
import { basename } from "path";

export type DateFileRecordProps = {
	path: string;
};

export class DataFileRecord extends ImmuRecord<DateFileRecordProps>({
	path: ""
}) {

	public get id(): string {
		return this.fileName;
	}

	public get fileName(): string {
		return basename(this.path).trim();
	}

	public static fromDescription(path: string): DataFileRecord {
		return new DataFileRecord({ path });
	}
}
