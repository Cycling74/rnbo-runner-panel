import { ActionBase, AppThunk } from "../lib/store";
import { DataFileRecord, PendingDataFileRecord } from "../models/datafile";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { dayjs, isUserAbortedError } from "../lib/util";
import { DialogResult, showConfirmDialog } from "../lib/dialogs";
import { getDataFiles, getPendingDataFileByFilename } from "../selectors/datafiles";
import { DataRefRecord } from "../models/dataref";
import { getPatcherInstanceDataRef } from "../selectors/patchers";
import { getFileListFromRemote, deleteFileFromRemote } from "./files";
import { RunnerFileType } from "../lib/constants";

export enum DataFilesActionType {
	SET_ALL = "SET_DATAFILES",

	SET_PENDING = "SET_PENDING",
	DELETE_PENDING = "REMOVE_PENDING_DATAFILE"
}

export interface ISetDataFiles extends ActionBase {
	type: DataFilesActionType.SET_ALL;
	payload: {
		files: Array<DataFileRecord>;
	}
}
export interface ISetPendingDataFile extends ActionBase {
	type: DataFilesActionType.SET_PENDING;
	payload: {
		file: PendingDataFileRecord;
	}
}

export interface IDeletePendingDataFile extends ActionBase {
	type: DataFilesActionType.DELETE_PENDING;
	payload: {
		file: PendingDataFileRecord;
	}
}

export type DataFileAction = ISetDataFiles |
ISetPendingDataFile | IDeletePendingDataFile;


export const initDataFiles = (paths: string[]): ISetDataFiles => {
	return {
		type: DataFilesActionType.SET_ALL,
		payload: {
			files: paths.map(p => DataFileRecord.fromDescription(p))
		}
	};
};

export const addPendingDataFile = (filename: string, dataRef: DataRefRecord): DataFileAction => {
	return {
		type: DataFilesActionType.SET_PENDING,
		payload: {
			file: PendingDataFileRecord.fromDescription(filename, dataRef.id)
		}
	};
};

export const deletePendingDataFile = (file: PendingDataFileRecord): DataFileAction => {
	return {
		type: DataFilesActionType.DELETE_PENDING,
		payload: {
			file
		}
	};
};

export const updateDataFiles = (paths: string[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();
			const files = paths.map(p => DataFileRecord.fromDescription(p));
			const currentFiles = getDataFiles(state);

			const newFiles: Array<DataFileRecord> = [];

			for (const file of files) {
				if (!currentFiles.has(file.id)) {
					newFiles.push(file);
				}
			}

			if (
				newFiles.length === 1 &&
				/^\d{6}T\d{6}-captured\.wav$/.test(newFiles[0].fileName) &&
				newFiles[0].fileName.startsWith(dayjs().format("YYMMDDT"))
			) {
				dispatch(showNotification({
					level: NotificationLevel.success,
					title: "Saved Recording",
					message: `Recording has been saved successfully to ${newFiles[0].fileName}`
				}));
			}

			for (const fulfilledFile of newFiles.map(f => getPendingDataFileByFilename(state, f.fileName)).filter(pf => !!pf)) {
				const dataRef = getPatcherInstanceDataRef(state, fulfilledFile.dataRefId);
				if (dataRef) {
					dispatch(showNotification({
						level: NotificationLevel.success,
						title: "Saved Buffer",
						message: `The contents of ${dataRef.name} have been saved to ${fulfilledFile.fileName}`
					}));
				}
				dispatch(deletePendingDataFile(fulfilledFile));
			}

			dispatch({
				type: DataFilesActionType.SET_ALL,
				payload: { files }
			} as ISetDataFiles);
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to update list of audio files",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const triggerDataFileListRefresh = (init: boolean = false): AppThunk =>
	async (dispatch) => {
		try {
			const list = await getFileListFromRemote(RunnerFileType.DataFile);
			const files = list.items.filter(f => !f.dir).map(f => f.name);
			dispatch(
				init
					? initDataFiles(files)
					: updateDataFiles(files)
			);
		} catch (err) {
			dispatch(showNotification({
				title: "Error while requesting audio file list",
				message: `${err.message} - Please check the console for more details`,
				level: NotificationLevel.error
			}));
			console.error(err);
		}
	};

export const deleteDataFileOnRemote = (file: DataFileRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the file ${file.fileName} from the device?`,
				actions: {
					confirm: { label: "Delete File", color: "red"}
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			await deleteFileFromRemote(RunnerFileType.DataFile, file.fileName);

			dispatch(showNotification({
				level: NotificationLevel.success,
				title: "File Deleted",
				message: `Successfully deleted ${file.fileName} from the device`
			}));

		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete audio file ${file.id}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const downloadDataFileFromRunner = (file: DataFileRecord): AppThunk =>
	async (dispatch) => {
		try {
			const link = document.createElement("a");
			link.href = `http://${window.location.host}/files/datafiles/${file.fileName}`;
			link.download = file.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			if (isUserAbortedError(err)) return; // User Aborted File Destination chooser

			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to download data file ${file.fileName}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};
