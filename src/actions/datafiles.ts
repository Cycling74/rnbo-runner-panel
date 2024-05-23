import { ActionBase } from "../lib/store";

export enum DataFilesActionType {
	INIT = "INIT",
}

export interface IInitDataFiles extends ActionBase {
	type: DataFilesActionType.INIT;
	payload: {
		files: string[]
	}
}

export type DataFileAction = IInitDataFiles;

export const initDataFiles = (files: string[]): DataFileAction => {
	return {
		type: DataFilesActionType.INIT,
		payload: {
			files: files.sort()
		}
	};
};
