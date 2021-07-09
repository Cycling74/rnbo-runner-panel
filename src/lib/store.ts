import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import thunk, { ThunkAction, ThunkDispatch } from "redux-thunk";
import { rootReducer } from "../reducers";
import { Dispatch } from "react";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export interface ActionBase extends AnyAction {
	type: string,
	error?: Error,
	payload: Record<string, any>
};

export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
  RootStateType,
  undefined,
  ActionBase
>;

export const store = createStore(
	rootReducer,
	undefined, // reducers define their own initial state
	applyMiddleware(thunk)
);

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatch = Dispatch<AnyAction> & ThunkDispatch<RootStateType, undefined, ActionBase>;

