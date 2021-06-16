import { createContext, useContext, useEffect, useReducer } from "react";
import { parse as parseQuery } from "querystring";
import { Map, Record as ImmuRecord } from "immutable";

export const DeviceContext = createContext(null);

const ActionTypes = {
	setConnectionState: "setConnectionState"
};

const reducer = (state, action) => {

	switch (action.type) {
		case ActionTypes.setConnectionState:
			return state.set("connectionState", action.payload.connectionState);
		default:
			return state;
	}
};

const initState = () => {
	return Map<string, any>(new Array(
		["connectionState", WebSocket.CLOSED]
	));
};

export const DeviceProvider = ({children}) => {

	const [state, dispatch] = useReducer(reducer, null, initState);
	const connectionState = state.get("connectionState");

	useEffect(() => {
		let { wsport } = parseQuery(location.search?.slice(1));
		if (!wsport || process.env.NODE_ENV === "development") wsport = "5678";
		const wsurl = `ws://${location.hostname}:${wsport}`;

		const ws = new WebSocket(wsurl);

		ws.addEventListener("open", () => {
			dispatch({
				type: ActionTypes.setConnectionState,
				payload: {
					connectionState: ws.readyState
				}
			});
		});

		ws.addEventListener("close", () => {
			dispatch({
				type: ActionTypes.setConnectionState,
				payload: {
					connectionState: ws.readyState
				}
			});
		});
	}, []);


    return <DeviceContext.Provider value={{ connectionState }}>
        { children }
    </DeviceContext.Provider>
}

export const DeviceConsumer = DeviceContext.Consumer;
