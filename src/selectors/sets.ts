import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { SetRecord } from "../models/set";

export const getSets = (state: RootStateType): ImmuMap<SetRecord["id"], SetRecord> => {
	return state.sets.sets;
};

export const getSet = (state: RootStateType, name: string): SetRecord | undefined => {
	return state.sets.sets.get(name);
};
