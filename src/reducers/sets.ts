import { Map as ImmuMap, OrderedSet as ImmuOrderedSet } from "immutable";
import { GraphSetRecord, GraphSetViewRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { GraphSetAction, GraphSetActionType } from "../actions/sets";

export type SetState = {

	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>;

	currentId: GraphSetRecord["id"];
	currentIsDirty: boolean;

	initialSet: string | undefined;

	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
	presetLatest: string;

	selectedView: GraphSetViewRecord["id"] | undefined,
	views: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>;
	viewOrder: ImmuOrderedSet<GraphSetViewRecord["id"]>;
};

export const sets = (state: SetState = {
	sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(),

	currentId: "",
	currentIsDirty: false,

	initialSet: undefined,

	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	presetLatest: "",

	selectedView: undefined,
	views: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>(),
	viewOrder: ImmuOrderedSet<GraphSetViewRecord["id"]>()

}, action: GraphSetAction): SetState => {

	switch (action.type) {

		case GraphSetActionType.INIT_SETS: {
			const { sets } = action.payload;

			return {
				...state,
				sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>(sets.map(p => [p.id, p]))
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

		case GraphSetActionType.SET_SET_CURRENT: {
			const { name } = action.payload;
			return {
				...state,
				currentId: name
			};
		}

		case GraphSetActionType.SET_SET_CURRENT_DIRTY: {
			const { dirty } = action.payload;
			return {
				...state,
				currentIsDirty: dirty
			};
		}

		case GraphSetActionType.SET_SET_INITIAL: {
			const { name } = action.payload;
			return {
				...state,
				initialSet: name || undefined
			}
		}

		case GraphSetActionType.INIT_SET_VIEWS: {
			const { order, views } = action.payload;
			const viewRecords = ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>(views.map(v => [v.id, v]));
			return {
				...state,
				selectedView: views.length ? views[0].id : undefined,
				views: viewRecords,
				viewOrder: ImmuOrderedSet<GraphSetViewRecord["id"]>(order)
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
				views: newViews,
				viewOrder: state.viewOrder.delete(view.id)
			};
		}

		case GraphSetActionType.SET_SET_VIEW: {
			const { view } = action.payload;

			return {
				...state,
				selectedView: state.selectedView === undefined ? view.id : state.selectedView,
				views: state.views.set(view.id, view)
			};
		}

		case GraphSetActionType.SET_SET_VIEW_ORDER: {
			const { order } = action.payload;

			return {
				...state,
				viewOrder: ImmuOrderedSet<GraphSetViewRecord["id"]>(order)
			};
		}

		default:
			return state;
	}
};
