import { Map as ImmuMap } from "immutable";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { GraphSetAction, GraphSetActionType } from "../actions/sets";

export type SetState = {
	show: boolean;
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>;
	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
};

export const sets = (state: SetState = {

	show: false,
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(),
	presets: ImmuMap<GraphSetRecord["id"], PresetRecord>()
}, action: GraphSetAction): SetState => {

	switch (action.type) {

		case GraphSetActionType.INIT: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(sets.map(p => [p.id, p]))
			};
		}

		case GraphSetActionType.SET_SHOW_GRAPH_SETS: {
			const { show } = action.payload;
			return {
				...state,
				show
			};
		}

		case GraphSetActionType.INIT_PRESETS: {
			const { presets } = action.payload;

			return {
				...state,
				presets: ImmuMap<PresetRecord["id"], PresetRecord>(presets.map(p => [p.id, p]))
			};
		}

		default:
			return state;
	}
};
