import { Set as ImmuSet } from "immutable";
import { DataFileAction, DataFilesActionType } from "../actions/datafiles";

export type DataFileState = {
	files: ImmuSet<string>
};

export const datafiles = (state: DataFileState = {
	files: ImmuSet<string>()
}, action: DataFileAction): DataFileState => {
	switch (action.type) {
		case DataFilesActionType.INIT: {
			const { files } = action.payload;
			return {
				...state,
				files: ImmuSet(files)
			};
		}
		default:
			return state;
	}
};
