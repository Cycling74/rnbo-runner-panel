import { Record as ImmuRecord } from "immutable";
import { basename } from "path";
import { DataRefRecord } from "./dataref";

export type DateFileRecordProps = {
	fileName: string;
	path: string;
};

export class DataFileRecord extends ImmuRecord<DateFileRecordProps>({
	fileName: "",
	path: ""
}) {

	public get id(): string {
		return this.fileName;
	}

	public matchesQuery(query: string): boolean {
		return !query.length || this.fileName.toLowerCase().includes(query);
	}

	public static fromDescription(path: string): DataFileRecord {
		return new DataFileRecord({
			fileName: basename(path).trim(),
			path
		});
	}
}

export type PendingDataFileRecordProps = {
	fileName: string;
	dataRefId: DataRefRecord["id"];
};

export class PendingDataFileRecord extends ImmuRecord<PendingDataFileRecordProps>({
	fileName: "",
	dataRefId: ""
}) {

	public get id(): string {
		return this.fileName;
	}

	public static fromDescription(path: string, dataRefId: DataRefRecord["id"]): PendingDataFileRecord {
		return new PendingDataFileRecord({
			fileName: basename(path).trim(),
			dataRefId
		});
	}
}
