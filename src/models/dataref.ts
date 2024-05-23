import { Record as ImmuRecord } from "immutable";

export type DataRefRecordProps = {
	id: string;
	value: string;
};

export class DataRefRecord extends ImmuRecord<DataRefRecordProps>({
	id: "",
	value: ""
}) {

	public static fromDescription(id: string, value: string): DataRefRecord {
		return new DataRefRecord({ id, value });
	}
}
