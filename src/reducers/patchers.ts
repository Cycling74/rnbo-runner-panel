import { Map as ImmuMap } from "immutable";
import { PatcherRecord } from "../models/patcher";
import { PatcherAction, PatcherActionType } from "../actions/patchers";

export interface PatcherState {
	patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>;
}

export const patchers = (state: PatcherState = {

	patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>()

}, action: PatcherAction): PatcherState => {

	switch (action.type) {

		case PatcherActionType.INIT: {
			const { patchers } = action.payload;

			return {
				...state,
				patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>(patchers.map(p => [p.id, p]))
			};
		}

		default:
			return state;
	}
};
