import { List as ImmuList } from "immutable";
import { DataFileAction, DataFilesActionType } from "../actions/datafiles";

export type DataFileState = {
	files: ImmuList<string>
};

export const datafiles = (state: DataFileState = {
	files: ImmuList<string>()
}, action: DataFileAction): DataFileState => {
	switch (action.type) {
		case DataFilesActionType.INIT: {
			const { files } = action.payload;
			return {
				...state,
				files: ImmuList(files)
			};
		}
		default:
			return state;
	}
};
