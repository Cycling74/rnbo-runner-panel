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
			.sort((a, b) => {
				return collator.compare(a.fileName.toLowerCase(), b.fileName.toLowerCase()) * (order === SortOrder.Asc ? 1 : -1);
			});
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
