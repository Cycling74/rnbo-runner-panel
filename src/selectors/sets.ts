import { Map as ImmuMap, OrderedSet as ImmuOrderedSet } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphSetRecord, GraphSetViewRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { createSelector } from "reselect";
import { SortOrder } from "../lib/constants";
import { getRunnerConfig } from "./settings";
import { ConfigKey, ConfigRecord } from "../models/config";
import { OSCQueryValueType } from "../lib/types";

export const getGraphSets = (state: RootStateType): ImmuMap<GraphSetRecord["id"], GraphSetRecord> => {
	return state.sets.sets;
};

export const getCurrentGraphSetId = (state: RootStateType): string => state.sets.currentId;
export const getCurrentGraphSetIsDirty = (state: RootStateType): boolean => state.sets.currentIsDirty;

export const getCurrentGraphSet = createSelector(
	[
		getGraphSets,
		getCurrentGraphSetId
	],
	(sets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>, currentId: GraphSetRecord["id"]): GraphSetRecord | undefined => {
		return sets.get(currentId) || undefined;
	}
);

export const getInitialGraphSet = createSelector(
	[
		getGraphSets,
		(state: RootStateType): ConfigRecord => getRunnerConfig(state, ConfigKey.AutoStartLastSet),
		(state: RootStateType): GraphSetRecord["name"] | undefined => state.sets.initialSet
	],
	(sets, config, initial): GraphSetRecord | undefined => {
		if (config.oscType ===  OSCQueryValueType.False) return undefined;
		return initial
			? sets.get(initial) || undefined
			: undefined
	}
)

export const getGraphSet = createSelector(
	[
		getGraphSets,
		(state: RootStateType, name: string): string => name
	],
	(sets, name): GraphSetRecord | undefined => {
		return sets.get(name);
	}
);

export const getGraphSetsSortedByName = createSelector(
	[
		getGraphSets,
		(state: RootStateType, order: SortOrder): SortOrder => order,
		(state: RootStateType, order: SortOrder, query?: string): string => query?.toLowerCase() || ""
	],
	(sets, order, query) => {
		const collator = new Intl.Collator("en-US");
		return sets
			.valueSeq()
			.filter(s => s.matchesQuery(query))
			.sort((left: GraphSetRecord, right: GraphSetRecord): number => {
				return collator.compare(left.name, right.name) * (order === SortOrder.Asc ? 1 : -1);
			});
	}
);

export const getGraphPresets = (state: RootStateType): ImmuMap<string, PresetRecord> => {
	return state.sets.presets;
};

export const getGraphPreset = createSelector(
	[
		getGraphPresets,
		(state: RootStateType, id: string): string => id
	],
	(presets, id): PresetRecord | undefined => {
		return presets.get(id);
	}
);

// sort initial first
export const getGraphSetPresetsSortedByName = createSelector(
	[
		getGraphPresets,
		(state: RootStateType, order: SortOrder): SortOrder => order
	],
	(presets, order) => {
		const collator = new Intl.Collator("en-US");
		return presets.valueSeq().sort((left: PresetRecord, right: PresetRecord): number => {
			let result;
			if (left.name === right.name) {
				result = 0;
			} else if (left.name === "initial") {
				result = -1;
			} else if (right.name === "initial") {
				result = 1;
			} else {
				result = collator.compare(left.name, right.name);
			}
			return result * (order === SortOrder.Asc ? 1 : -1);
		});
	}
);

export const getGraphSetViews = (state: RootStateType): ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord> => {
	return state.sets.views;
};

export const getGraphSetViewOrder = (state: RootStateType): ImmuOrderedSet<GraphSetViewRecord["id"]> => {
	return state.sets.viewOrder;
};

export const getGraphSetViewsBySortOrder = createSelector(
	[
		getGraphSetViews,
		getGraphSetViewOrder
	],
	(views, order): ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord> => {
		return ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>().withMutations(map => {
			order.forEach(o => {
				const view = views.get(o);
				if (view) {
					map.set(view.id, view);
				}
			});
		});
	}
);

export const getGraphSetView = createSelector(
	[
		getGraphSetViews,
		(state: RootStateType, id: GraphSetViewRecord["id"]): number => id
	],
	(views, id): GraphSetViewRecord | undefined => {
		return views.get(id);
	}
);

export const getSelectedGraphSetView = (state: RootStateType): GraphSetViewRecord | undefined => {
	return state.sets.selectedView !== undefined ? state.sets.views.get(state.sets.selectedView) : undefined;
};
