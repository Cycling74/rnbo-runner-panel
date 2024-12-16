import { combineReducers } from "redux";

import { appStatus } from "./appStatus";
import { datafiles } from "./datafiles";
import { editor } from "./editor";
import { patchers } from "./patchers";
import { graph } from "./graph";
import { nofitications } from "./notifications";
import { settings } from "./settings";
import { sets } from "./sets";
import { transport } from "./transport";

export const rootReducer = combineReducers({
	appStatus,
	datafiles,
	editor,
	graph,
	nofitications,
	patchers,
	settings,
	sets,
	transport
});

export type RootReducerType = typeof rootReducer;
