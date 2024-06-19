import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { createSelector } from "reselect";
import { SortOrder } from "../lib/constants";

export const getGraphSets = (state: RootStateType): ImmuMap<GraphSetRecord["id"], GraphSetRecord> => {
	return state.sets.sets;
};

export const getGraphSet = createSelector(
	[
		getGraphSets,
		(state: RootStateType, name: string): string => name
	],
	(sets, name): GraphSetRecord | undefined => {
		return sets.get(name);
	}
);

const collator = new Intl.Collator("en-US");

export const getGraphSetsSortedByName = createSelector(
	[
		getGraphSets,
		(state: RootStateType, order: SortOrder): SortOrder => order
	],
	(sets, order) => {
		return sets.valueSeq().sort((left: GraphSetRecord, right: GraphSetRecord): number => {
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
