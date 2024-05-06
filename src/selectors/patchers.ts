import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherRecord } from "../models/patcher";

export const getPatchers = (state: RootStateType): ImmuMap<PatcherRecord["id"], PatcherRecord> => {
	return state.patchers.patchers;
};

export const getPatcher = (state: RootStateType, name: string): PatcherRecord | undefined => {
	return state.patchers.patchers.get(name);
};
