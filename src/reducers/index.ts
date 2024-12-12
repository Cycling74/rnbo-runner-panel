import { combineReducers } from "redux";

import { appStatus } from "./appStatus";
import { datafiles } from "./datafiles";
import { editor } from "./editor";
import { instances } from "./instances";
import { graph } from "./graph";
import { nofitications } from "./notifications";
import { patchers } from "./patchers";
import { settings } from "./settings";
import { sets } from "./sets";
import { transport } from "./transport";

export const rootReducer = combineReducers({
	appStatus,
	datafiles,
	editor,
	instances,
	graph,
	nofitications,
	patchers,
	settings,
	sets,
	transport
});

export type RootReducerType = typeof rootReducer;
