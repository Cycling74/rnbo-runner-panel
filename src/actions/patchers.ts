import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOPatchersState } from "../lib/types";
import { PatcherRecord } from "../models/patcher";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { writePacket, OSCMessage } from "osc";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";

export enum PatcherActionType {
	INIT = "INIT_PATCHERS"
}

export interface IInitPatchers extends ActionBase {
	type: PatcherActionType.INIT;
	payload: {
		patchers: PatcherRecord[]
	}
}

export type PatcherAction = IInitPatchers;


export const initPatchers = (patchersInfo: OSCQueryRNBOPatchersState): PatcherAction => {

	const patchers: PatcherRecord[] = [];
	for (const [name, desc] of Object.entries(patchersInfo.CONTENTS || {})) {
		patchers.push(PatcherRecord.fromDescription(name, desc));
	}

	return {
		type: PatcherActionType.INIT,
		payload: {
			patchers
		}
	};
};

export const destroyPatcherOnRemote = (patcher: PatcherRecord): AppThunk =>
	(dispatch) => {
		try {
			const message: OSCMessage = {
				address: `/rnbo/patchers/${patcher.name}/destroy`,
				args: []
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete patcher ${patcher.name}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};


export const renamePatcherOnRemote = (patcher: PatcherRecord, newName: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `/rnbo/patchers/${patcher.name}/rename`,
				args: [
					{ type: "s", value: newName }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename patcher ${patcher.name} -> ${newName}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};
