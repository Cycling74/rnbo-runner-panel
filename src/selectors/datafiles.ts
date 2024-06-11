import { Seq } from "immutable";
import { RootStateType } from "../lib/store";

const collator = new Intl.Collator("en-US");

export const getDataFiles = (state: RootStateType): Seq.Indexed<string> => {
	return state.datafiles.files.valueSeq().sort((a, b) => {
		return collator.compare(a.toLowerCase(), b.toLowerCase());
	});
};
