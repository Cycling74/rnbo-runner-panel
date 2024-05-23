import { Record as ImmuRecord } from "immutable";

export type DataRefRecordProps = {
	id: string;
	fileName: string;
};

export class DataRefRecord extends ImmuRecord<DataRefRecordProps>({
	id: "",
	fileName: ""
}) {

	public static fromDescription(id: string, fileName: string): DataRefRecord {
		return new DataRefRecord({ id, fileName });
	}

	public setFileName(v: string) : DataRefRecord {
		return this.set("fileName", v);
	}
}
