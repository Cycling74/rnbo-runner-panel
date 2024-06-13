import { Map as ImmuMap } from "immutable";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { GraphSetAction, GraphSetActionType } from "../actions/sets";

export type SetState = {
	show: boolean;
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>;
	latest: string;
	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
	presetLatest: string;
};

export const sets = (state: SetState = {
	show: false,
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(),
	latest: "",
	presets: ImmuMap<GraphSetRecord["id"], PresetRecord>(),
	presetLatest: ""
}, action: GraphSetAction): SetState => {

	switch (action.type) {

		case GraphSetActionType.INIT: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(sets.map(p => [p.id, p.setLatest(p.name === state.latest)]))
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
				presets: ImmuMap<PresetRecord["id"], PresetRecord>(presets.map(p => [p.id, p.setLatest(p.name === state.presetLatest)]))
			};
		}

		case GraphSetActionType.SET_SET_PRESET_LATEST: {
			const { name } = action.payload;
			return {
				...state,
				presetLatest: name,
				presets: state.presets.map(preset => { return preset.setLatest(preset.name === name); })
			};
		}

		case GraphSetActionType.SET_SET_LATEST: {
			const { name } = action.payload;
			return {
				...state,
				latest: name,
				sets: state.sets.map(set => { return set.setLatest(set.name === name); })
			};
		}

		default:
			return state;
	}
};
