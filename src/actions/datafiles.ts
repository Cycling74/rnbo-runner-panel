import { ActionBase, AppThunk } from "../lib/store";
import { DataFileRecord } from "../models/datafile";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { readFileAsBase64 } from "../lib/util";
import { RunnerCmd, oscQueryBridge } from "../controller/oscqueryBridgeController";
import { RunnerCmdMethod } from "../lib/constants";

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

export const uploadFileToRemote = (file: File, { resolve, reject, onProgress }: { resolve: () => any; reject: (error: Error) => any; onProgress: (p: number) => any; }): AppThunk =>
	async (dispatch) => {
		try {
			const chunkSize = Math.pow(1024, 2);
			const b64 = await readFileAsBase64(file);

			const progressStepSize = (file.length / chunkSize) * 100;

			// Send file in chunks
			for (let i = 0; i < b64.length; i += chunkSize) {
				await oscQueryBridge.sendCmd(
					new RunnerCmd(RunnerCmdMethod.WriteFile, {
						filename: file.name,
						filetype: "datafile",
						data: b64.slice(i, i + chunkSize),
						append: i !== 0
					})
				);
				console.log("progress", i * progressStepSize);
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
			return void resolve();
		} catch (err) {
			console.log(err);
			return void reject(err);
		}
	};
