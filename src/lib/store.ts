import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { rootReducer, RootStateType } from "../reducers";
import { EntityType } from "../reducers/entities";
import { Map } from "immutable";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const initState: (() => RootStateType) = () => {
	return {
		network: { connectionStatus: WebSocket.CLOSED, connectionError: undefined },
		entities: {
			[EntityType.ParameterRecord]: Map<string, ParameterRecord>(),
			[EntityType.InportRecord]: Map<string, InportRecord>(),
		}
	};
};

export const store = createStore(
	rootReducer,
	initState(),
	applyMiddleware(thunk)
);
