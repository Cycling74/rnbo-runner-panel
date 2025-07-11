import { ActionBase, AppThunk } from "../lib/store";
import { DataFileRecord, PendingDataFileRecord } from "../models/datafile";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { RunnerCmd, oscQueryBridge } from "../controller/oscqueryBridgeController";
import { RunnerCmdMethod } from "../lib/constants";
import { dayjs } from "../lib/util";
import * as Base64 from "js-base64";
import { DialogResult, showConfirmDialog } from "../lib/dialogs";
import { getDataFiles, getPendingDataFileByFilename } from "../selectors/datafiles";
import { DataRefRecord } from "../models/dataref";
import { getPatcherInstanceDataRef } from "../selectors/patchers";

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

export const deleteDataFileOnRemote = (file: DataFileRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the file ${file.id} from the device?`,
				actions: {
					confirm: { label: "Delete File", color: "red"}
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			await oscQueryBridge.sendCmd(
				new RunnerCmd(RunnerCmdMethod.DeleteFile, {
					filename: file.fileName,
					filetype: "datafile"
				})
			);
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete sample file ${file.id}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const uploadFileToRemote = (file: File, { resolve, reject, onProgress }: { resolve: () => any; reject: (error: Error) => any; onProgress: (p: number) => any; }): AppThunk =>
	async (dispatch) => {
		try {
			const chunkSize = Math.pow(1024, 2);
			const steps = (file.size / chunkSize);

			// Send file in chunks
			for (let i = 0; i < file.size; i += chunkSize) {
				const chunk = await file.slice(i, i + chunkSize).arrayBuffer();
				const encoded = Base64.fromUint8Array(new Uint8Array(chunk), false);
				await oscQueryBridge.sendCmd(
					new RunnerCmd(RunnerCmdMethod.WriteFile, {
						filename: file.name,
						filetype: "datafile",
						data: encoded,
						append: i !== 0
					})
				);
				onProgress((i / chunkSize) / steps * 100);
			}

			// Send Complete Message
			await oscQueryBridge.sendCmd(
				new RunnerCmd(RunnerCmdMethod.WriteFile, {
					filename: file.name,
					filetype: "datafile",
					data: "",
					append: true,
					complete: true
				})
			);
			onProgress(100);
			return void resolve();
		} catch (err) {
			console.log(err);
			return void reject(err);
		}
	};
