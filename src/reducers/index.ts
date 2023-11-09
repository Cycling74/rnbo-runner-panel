import { combineReducers } from "redux";

import { appStatus } from "./appStatus";
import { instances } from "./instances";
import { graph } from "./graph";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";
import { config } from "./config";

export const rootReducer = combineReducers({
	appStatus,
	instances,
	graph,
	nofitications,
	patchers,
	settings,
	config
});

export type RootReducerType = typeof rootReducer;
