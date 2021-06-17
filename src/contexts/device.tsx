import { createContext, useContext, useEffect, useReducer } from "react";
import { parse as parseQuery } from "querystring";
import { Map, Record as ImmuRecord } from "immutable";
import { DeviceRecord } from "../models/device";
import { writePacket } from "osc";

export type AppContext = {
	connectionState: WebSocket["CLOSED"] | WebSocket["CLOSING"] | WebSocket["OPEN"] | WebSocket["CONNECTING"],
	device?: DeviceRecord,
	setParameterValueNormalized: (name: string, value: number) => void
};

export const DeviceContext = createContext<AppContext>(null);

const ActionTypes = {
	setConnectionState: "setConnectionState",
	updateDevice: "updateDevice"
};

const reducer = (state, action) => {

	switch (action.type) {
		case ActionTypes.setConnectionState:
			return state.set("connectionState", action.payload.connectionState);

		case ActionTypes.updateDevice:
			let newDevice = DeviceRecord.fromDeviceDescription(action.payload);
			return state.set("device", newDevice);

		default:
			return state;
	}
};

const initState = () => {
	return Map<string, any>(new Array(
		["connectionState", WebSocket.CLOSED]
	));
};

let { wsport } = parseQuery(location.search?.slice(1));
if (!wsport || process.env.NODE_ENV === "development") wsport = "5678";
const wsurl = `ws://${location.hostname}:${wsport}`;

const ws = new WebSocket(wsurl);

export const DeviceProvider = ({children}) => {

	const [state, dispatch] = useReducer(reducer, null, initState);
	const connectionState = state.get("connectionState");
	const device = state.get("device");
	const setParameterValueNormalized = async (name: string, value: number) => {
		const address = `/rnbo/inst/0/params/${name}/normalized`;
		const message = {
			address,
			args: [
				{ type: "f", value }
			]
		};
		const binary = writePacket(message);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(Buffer.from(binary));
		}
	};

	const handleMessage = (m) => {
		try {
			if (typeof m.data === "string") {
				const data = JSON.parse(m.data);
				dispatch({
					type: ActionTypes.updateDevice,
					payload: data
				});
			} else {

			}
		} catch (e) {
			// console.error(e);
		}
	};

	useEffect(() => {
		ws.addEventListener("open", () => {
			dispatch({
				type: ActionTypes.setConnectionState,
				payload: {
					connectionState: ws.readyState
				}
			});

			// Fetch the instrument description
			ws.send("/rnbo/inst/0");
		});

		ws.addEventListener("close", () => {
			dispatch({
				type: ActionTypes.setConnectionState,
				payload: {
					connectionState: ws.readyState
				}
			});
		});

		ws.addEventListener("message", (m) => {
			handleMessage(m);
		});
	}, []);


	return <DeviceContext.Provider value={{ connectionState, device, setParameterValueNormalized }}>
		{ children }
	</DeviceContext.Provider>
}

export const DeviceConsumer = DeviceContext.Consumer;
