import { Map as ImmuMap } from "immutable";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { GraphSetAction, GraphSetActionType } from "../actions/sets";

export type SetState = {
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>;
	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
};

export const sets = (state: SetState = {
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(),
	presets: ImmuMap<GraphSetRecord["id"], PresetRecord>()
}, action: GraphSetAction): SetState => {

	switch (action.type) {

		case GraphSetActionType.INIT_SETS: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>().withMutations(map => {
					sets.forEach(s => map.set(s.id, s));
				})
			};
		}

		case GraphSetActionType.INIT_SET_PRESETS: {
			const { presets } = action.payload;

			return {
				...state,
				presets: ImmuMap<PresetRecord["id"], PresetRecord>().withMutations(map => {
					presets.forEach(p => map.set(p.id, p));
				})
			};
		}

		case GraphSetActionType.SET_SET_PRESET_LATEST: {
			const { name } = action.payload;
			return {
				...state,
				presets: state.presets.map(preset => preset.setLatest(preset.name === name))
			};
		}

		case GraphSetActionType.SET_SET_LATEST: {
			const { name } = action.payload;
			return {
				...state,
				sets: state.sets.map(set => set.setLatest(set.name === name))
			};
		}

		case GraphSetActionType.SET_SET_INITIAL: {
			const { name } = action.payload;
			return {
				...state,
				sets: state.sets.map(set => set.setInitial(set.name === name))
			};
		}

		default:
			return state;
	}
};
