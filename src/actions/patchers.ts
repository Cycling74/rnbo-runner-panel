import { ActionBase } from "../lib/store";
import { OSCQueryRNBOPatchersState } from "../lib/types";
import { PatcherRecord } from "../models/patcher";

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
