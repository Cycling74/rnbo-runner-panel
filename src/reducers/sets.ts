import { Map as ImmuMap } from "immutable";
import { GraphSetRecord, GraphSetViewRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { GraphSetAction, GraphSetActionType } from "../actions/sets";

export type SetState = {
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>;
	latest: string;
	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
	presetLatest: string;

	selectedView: GraphSetViewRecord["id"] | undefined,
	views: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>;
};

export const sets = (state: SetState = {
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(),
	latest: "",
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	presetLatest: "",
	selectedView: undefined,
	views: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>()
}, action: GraphSetAction): SetState => {

	switch (action.type) {

		case GraphSetActionType.INIT_SETS: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(sets.map(p => [p.id, p.setLatest(p.name === state.latest)]))
			};
		}

		case GraphSetActionType.INIT_SET_PRESETS: {
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

		case GraphSetActionType.INIT_SET_VIEWS: {
			const { views } = action.payload;
			return {
				...state,
				selectedView: views.length ? views[0].id : undefined,
				views: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>(views.map(v => [v.id, v]))
			};
		}

		case GraphSetActionType.LOAD_SET_VIEW: {
			const { view } = action.payload;
			return {
				...state,
				selectedView: view.id
			};
		}

		case GraphSetActionType.DELETE_SET_VIEW: {
			const { view } = action.payload;
			const newViews = state.views.delete(view.id);

			return {
				...state,
				selectedView: state.selectedView === view.id ? newViews.first()?.id || undefined : state.selectedView,
				views: newViews
			};
		}

		case GraphSetActionType.SET_SET_VIEW: {
			const { view } = action.payload;

			return {
				...state,
				views: state.views.set(view.id, view)
			};
		}

		default:
			return state;
	}
};
