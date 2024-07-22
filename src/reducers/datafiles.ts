import { Map as ImmuMap } from "immutable";
import { DataFileAction, DataFilesActionType } from "../actions/datafiles";
import { DataFileRecord } from "../models/datafile";

export type DataFileState = {
	files: ImmuMap<DataFileRecord["id"], DataFileRecord>;
};

export const datafiles = (state: DataFileState = {
	files: ImmuMap<DataFileRecord["id"], DataFileRecord>()
}, action: DataFileAction): DataFileState => {
	switch (action.type) {
		case DataFilesActionType.INIT: {
			const { files } = action.payload;
			return {
				...state,
				files: ImmuMap<DataFileRecord["id"], DataFileRecord>().withMutations(map => {
					for (const file of files) {
						map.set(file.id, file);
					}
				})
			};
		}
		default:
			return state;
	}
};
