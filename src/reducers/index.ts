import { combineReducers } from "redux";

import { appStatus } from "./appStatus";
import { instances } from "./instances";
import { graph } from "./graph";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";
import { sets } from "./sets";
import { transport } from "./transport";

export const rootReducer = combineReducers({
	appStatus,
	instances,
	graph,
	nofitications,
	patchers,
	settings,
	sets,
	transport
});

export type RootReducerType = typeof rootReducer;
