import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import thunk, { ThunkAction, ThunkDispatch } from "redux-thunk";
import { rootReducer } from "../reducers";
import { Dispatch } from "react";

type ComposeType = typeof compose;
declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: ComposeType;
	}
}

const composeEnhancers = typeof window !== "undefined" && process.env.NODE_ENV !== "production" ? ( window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as ComposeType ) || compose : compose;

export interface ActionBase extends AnyAction {
	type: string;
	error?: Error;
	payload: Record<string, any>;
}

export const store = createStore(
	rootReducer,
	undefined, // reducers define their own initial state
	composeEnhancers(applyMiddleware(thunk))
);

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatch = Dispatch<AnyAction> & ThunkDispatch<RootStateType, undefined, ActionBase>;

export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
RootStateType,
undefined,
ActionBase
>;
