import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherRecord } from "../models/patcher";

export const getPatchers = (state: RootStateType): ImmuMap<PatcherRecord["id"], PatcherRecord> => {
	return state.patchers.patchers;
};

const collator = new Intl.Collator("en-US");
export const getPatchersSortedByName = (state: RootStateType): ImmuMap<PatcherRecord["id"], PatcherRecord> => {
	return state.patchers.patchers.sort((pA, pB) => {
		return collator.compare(pA.name.toLowerCase(), pB.name.toLowerCase());
	});
};

export const getPatcher = (state: RootStateType, name: string): PatcherRecord | undefined => {
	return state.patchers.patchers.get(name);
};
