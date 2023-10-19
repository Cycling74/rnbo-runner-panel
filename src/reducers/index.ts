import { combineReducers } from "redux";

import { graph } from "./graph";
import { network } from "./network";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";

export const rootReducer = combineReducers({
	graph,
	network,
	nofitications,
	patchers,
	settings
});

export type RootReducerType = typeof rootReducer;
