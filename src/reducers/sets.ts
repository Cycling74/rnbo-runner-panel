import { Map as ImmuMap } from "immutable";
import { SetRecord } from "../models/set";
import { SetAction, SetActionType } from "../actions/sets";

export interface setstate {
	sets: ImmuMap<SetRecord["id"], SetRecord>;
}

export const sets = (state: setstate = {

	sets: ImmuMap<SetRecord["id"], SetRecord>()

}, action: SetAction): setstate => {

	switch (action.type) {

		case SetActionType.INIT: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<SetRecord["id"], SetRecord>(sets.map(p => [p.id, p]))
			};
		}

		default:
			return state;
	}
};
