import { combineReducers } from "redux";

import { entities } from "./entities";
import { network } from "./network";
import { nofitications } from "./notifications";
import { settings } from "./settings";

export const rootReducer = combineReducers({
	entities,
	network,
	nofitications,
	settings
});

export type RootReducerType = typeof rootReducer;
