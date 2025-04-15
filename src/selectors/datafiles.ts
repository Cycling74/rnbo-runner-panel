import { Map as ImmuMap, Seq } from "immutable";
import { createSelector } from "reselect";
import { RootStateType } from "../lib/store";
import { DataFileRecord } from "../models/datafile";
import { SortOrder } from "../lib/constants";

export const getDataFiles = (state: RootStateType): ImmuMap<DataFileRecord["id"], DataFileRecord> => {
	return state.datafiles.files;
};

export const getDataFile = createSelector(
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
