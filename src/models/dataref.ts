import { Record as ImmuRecord } from "immutable";

export type DataRefRecordProps = {
	id: string;
	fileName: string;
};

export class DataRefRecord extends ImmuRecord<DataRefRecordProps>({
	id: "",
	fileName: ""
}) {

	public setFileId(v: string) : DataRefRecord {
		return this.set("fileName", v);
	}

	public get fileId(): string {
		return this.fileName;
	}

	public static fromDescription(id: string, fileName: string): DataRefRecord {
		return new DataRefRecord({ id, fileName });
	}
}
