import { ActionBase, AppThunk } from "../lib/store";
import { DataFileRecord } from "../models/datafile";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { RunnerCmd, oscQueryBridge } from "../controller/oscqueryBridgeController";
import { RunnerCmdMethod } from "../lib/constants";
import * as Base64 from "js-base64";
import { DialogResult, showConfirmDialog } from "../lib/dialogs";

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
			const progressStepSize = (file.size / chunkSize) * 100;

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
				onProgress(i * progressStepSize);
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
