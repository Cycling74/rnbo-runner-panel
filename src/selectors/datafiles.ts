import { Map as ImmuMap, Seq } from "immutable";
import { RootStateType } from "../lib/store";
import { DataFileRecord } from "../models/datafile";

const collator = new Intl.Collator("en-US");

export const getDataFiles = (state: RootStateType): ImmuMap<DataFileRecord["id"], DataFileRecord> => {
	return state.datafiles.files;
};

export const getDataFile = (state: RootStateType, id: string): DataFileRecord | undefined => state.datafiles.files.get(id) || undefined;

export const getDataFilesSortedByName = (state: RootStateType): Seq.Indexed<DataFileRecord> => {
	return state.datafiles.files.valueSeq().sort((a, b) => {
		return collator.compare(a.fileName.toLowerCase(), b.fileName.toLowerCase());
	});
};
