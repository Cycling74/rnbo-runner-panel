import { combineReducers } from "redux";

import { appStatus } from "./appStatus";
import { editor } from "./editor";
import { graph } from "./graph";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";

export const rootReducer = combineReducers({
	appStatus,
	editor,
	graph,
	nofitications,
	patchers,
	settings
});

export type RootReducerType = typeof rootReducer;
