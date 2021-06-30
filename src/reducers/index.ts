import { combineReducers } from "redux";

import { entities } from "./entities";
import { network } from "./network";

export const rootReducer = combineReducers({
	entities,
	network
});

export type RootReducerType = typeof rootReducer;

export type RootStateType = ReturnType<typeof rootReducer>;
