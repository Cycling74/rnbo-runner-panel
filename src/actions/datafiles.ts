import { ActionBase, AppThunk } from "../lib/store";
import { DataFileRecord } from "../models/datafile";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";

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

export const deleteDataFileOnRemote = (file: DataFileRecord): AppThunk =>
	(dispatch) => {
		try {
			// oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete sample file ${file.id}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};
