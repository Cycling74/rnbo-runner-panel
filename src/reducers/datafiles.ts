import { Map as ImmuMap } from "immutable";
import { DataFileAction, DataFilesActionType } from "../actions/datafiles";
import { DataFileRecord, PendingDataFileRecord } from "../models/datafile";

export type DataFileState = {
	files: ImmuMap<DataFileRecord["id"], DataFileRecord>;
	pendingFiles: ImmuMap<PendingDataFileRecord["id"], PendingDataFileRecord>;
};

export const datafiles = (state: DataFileState = {
	files: ImmuMap<DataFileRecord["id"], DataFileRecord>(),
	pendingFiles: ImmuMap<PendingDataFileRecord["id"], PendingDataFileRecord>()
}, action: DataFileAction): DataFileState => {
	switch (action.type) {
		case DataFilesActionType.SET_ALL: {
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

		case DataFilesActionType.SET_PENDING: {
			const { file } = action.payload;
			return {
				...state,
				pendingFiles: state.pendingFiles.set(file.id, file)
			};
		}

		case DataFilesActionType.DELETE_PENDING: {
			const { file } = action.payload;
			return {
				...state,
				pendingFiles: state.pendingFiles.delete(file.id)
			};
		}

		default:
			return state;
	}
};
