import { ActionBase } from "../lib/store";
import { SetRecord } from "../models/set";

export enum SetActionType {
	INIT = "INIT_SETS"
}

export interface IInitSets extends ActionBase {
	type: SetActionType.INIT;
	payload: {
		sets: SetRecord[]
	}
}

export type SetAction = IInitSets;

export const initSets = (names: string[]): SetAction => {
	const sets: SetRecord[] = [];
	for (const name of names) {
		sets.push(SetRecord.fromDescription(name));
	}

	return {
		type: SetActionType.INIT,
		payload: {
			sets
		}
	};
};
