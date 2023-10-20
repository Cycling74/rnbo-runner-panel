import { combineReducers } from "redux";

import { editor } from "./editor";
import { graph } from "./graph";
import { network } from "./network";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";

export const rootReducer = combineReducers({
	editor,
	graph,
	network,
	nofitications,
	patchers,
	settings
});

export type RootReducerType = typeof rootReducer;
