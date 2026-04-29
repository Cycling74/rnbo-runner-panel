import { Map as ImmuMap, Seq } from "immutable";
import { createSelector } from "reselect";
import { RootStateType } from "../lib/store";
import { DataFileRecord, PendingDataFileRecord } from "../models/datafile";
import { SortOrder } from "../lib/constants";

export const getDataFiles = (state: RootStateType): ImmuMap<DataFileRecord["id"], DataFileRecord> => {
	return state.datafiles.files;
};

export const getDataFileByFilename = createSelector(
	[
		getDataFiles,
		(state: RootStateType, id: string): string => id

	],
	(files, id): DataFileRecord | undefined => {
		return files.get(id) || undefined;
	}
);

const collator = new Intl.Collator("en-US");

function comparePaths(a: string, b: string): number {
	const aParts = a.toLowerCase().split("/");
	const bParts = b.toLowerCase().split("/");
	for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
		const cmp = collator.compare(aParts[i], bParts[i]);
		if (cmp !== 0) return cmp;
	}
	return aParts.length - bParts.length;
}

export const getDataFilesSortedByName = createSelector(
	[
		getDataFiles,
		(state: RootStateType, order: SortOrder): SortOrder => order,
		(state: RootStateType, order: SortOrder, query?: string): string => query?.toLowerCase() || ""
	],
	(files, order, query): Seq.Indexed<DataFileRecord> => {
		return files
			.valueSeq()
			.filter(df => df.matchesQuery(query))
			.sort((a, b) => comparePaths(a.path, b.path) * (order === SortOrder.Asc ? 1 : -1));
	}
);

export const getPendingDataFiles = (state: RootStateType): ImmuMap<PendingDataFileRecord["id"], PendingDataFileRecord> => {
	return state.datafiles.pendingFiles;
};

export const getPendingDataFileByFilename = createSelector(
	[
		getPendingDataFiles,
		(state: RootStateType, id: string): string => id

	],
	(files, id): PendingDataFileRecord | undefined => {
		return files.get(id) || undefined;
	}
);
