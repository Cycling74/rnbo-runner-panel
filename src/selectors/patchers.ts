import { Map as ImmuMap, Seq } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherRecord } from "../models/patcher";
import { createSelector } from "reselect";
import { SortOrder } from "../lib/constants";

export const getPatchers = (state: RootStateType): ImmuMap<PatcherRecord["id"], PatcherRecord> => {
	return state.patchers.patchers;
};

export const getPatcher = createSelector(
	[
		getPatchers,
		(state: RootStateType, name: string): string => name
	],
	(patchers, name): PatcherRecord | undefined => {
		return patchers.get(name);
	}
);

const collator = new Intl.Collator("en-US");
export const getPatchersSortedByName = createSelector(
	[
		getPatchers,
		(state: RootStateType, order: SortOrder): SortOrder => order
	],
	(patchers, order): Seq.Indexed<PatcherRecord> => {
		return patchers.valueSeq().sort((pA, pB) => {
			return collator.compare(pA.name.toLowerCase(), pB.name.toLowerCase()) * (order === SortOrder.Asc ? 1 : -1);
		});
	}
);
