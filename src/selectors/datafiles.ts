import { List as ImmuList } from "immutable";
import { RootStateType } from "../lib/store";

export const getDataFiles = (state: RootStateType): ImmuList<string> => {
	return state.datafiles.files;
};
