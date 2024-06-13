import { ActionBase } from "../lib/store";
import { DataFileRecord } from "../models/datafile";

export enum DataFilesActionType {
	INIT = "INIT_DATAFILES",
}

export interface IInitDataFiles extends ActionBase {
	type: DataFilesActionType.INIT;
	payload: {
		files: Array<DataFileRecord>;
	}
}

export type DataFileAction = IInitDataFiles;

export const initDataFiles = (paths: string[]): DataFileAction => {
	return {
		type: DataFilesActionType.INIT,
		payload: {
			files: paths.map(p => DataFileRecord.fromDescription(p))
		}
	};
};
