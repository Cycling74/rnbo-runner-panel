import { Record as ImmuRecord } from "immutable";
import { basename } from "path";
import { DataRefRecord } from "./dataref";

export type DateFileRecordProps = {
	fileName: string;
	path: string;
	isDir: boolean;
};

export class DataFileRecord extends ImmuRecord<DateFileRecordProps>({
	fileName: "",
	path: "",
	isDir: false
}) {

	public get id(): string {
		return this.path;
	}

	public matchesQuery(query: string): boolean {
		return !query.length || this.path.toLowerCase().includes(query);
	}

	public static fromDescription(path: string, isDir = false): DataFileRecord {
		return new DataFileRecord({
			fileName: basename(path).trim(),
			path: path.trim(),
			isDir
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
