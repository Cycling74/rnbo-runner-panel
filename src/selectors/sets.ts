import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";

export const getGraphSets = (state: RootStateType): ImmuMap<GraphSetRecord["id"], GraphSetRecord> => {
	return state.sets.sets;
};

export const getGraphSet = (state: RootStateType, name: string): GraphSetRecord | undefined => {
	return state.sets.sets.get(name);
};

const collator = new Intl.Collator("en-US");

export const getGraphSetsSortedByName = (state: RootStateType) => {
	return state.sets.sets
		.valueSeq()
		.sort((left: GraphSetRecord, right: GraphSetRecord): number => collator.compare(left.name, right.name));
};

//sort initial first
export const getGraphSetPrsetsSortedByName = (state: RootStateType) => {
	return state.sets.presets
		.valueSeq()
		.sort((left: PresetRecord, right: PresetRecord): number => {
			if (left.name === right.name) {
				return 0;
			} else if (left.name === "initial") {
				return -1;
			} else if (right.name === "initial") {
				return 1;
			}
			return collator.compare(left.name, right.name);
		});
};

export const getShowGraphSetsDrawer = (state: RootStateType): boolean => state.sets.show;
