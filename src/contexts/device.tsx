import { createContext, useContext, useEffect, useReducer } from "react";
import { parse as parseQuery } from "querystring";
import { Map, Record as ImmuRecord } from "immutable";
import { DeviceRecord } from "../models/device";
import { writePacket, readPacket } from "osc";
import { MIDIEvent } from "@rnbo/js";

export type AppContext = {
	connectionState: WebSocket["CLOSED"] | WebSocket["CLOSING"] | WebSocket["OPEN"] | WebSocket["CONNECTING"],
	device?: DeviceRecord,
	setParameterValueNormalized: (name: string, value: number) => void,
	triggerMidiNoteEvent: (pitch: number, isNoteOn: boolean) => void,
	sendListToInport: (name: string, values: number[]) => void
};

export const DeviceContext = createContext<AppContext>(null);

const ActionTypes = {
	setConnectionState: "setConnectionState",
	setParameterValue: "setParameterValue",
	updateDevice: "updateDevice"
};

const reducer = (state: Map<string, any>, action) => {

	switch (action.type) {
		case ActionTypes.setConnectionState:
			return state.set("connectionState", action.payload.connectionState);

		case ActionTypes.setParameterValue:
			const parameterProperty = action.payload.normalized ? "normalizedValue" : "value";
			return state.setIn(["device", "parameters", action.payload.parameter, parameterProperty], action.payload.value);

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
	const device: DeviceRecord = state.get("device");

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

	const handleOSCMessage = (packet) => {
		const paramMatcher = /\/rnbo\/inst\/0\/params\/(\S+)/;
		const address: string = packet.address;

		let matches: string[];
		if ((matches = address.match(paramMatcher))) {
			const paramValue = packet.args[0];
			const paramPath = matches[1];
			let normalized = false;
			let paramName  = paramPath;
			if (paramPath.endsWith("/normalized")) {
				paramName = paramPath.slice(0, -("/normalized").length);
				normalized = true;
			}
			dispatch({
				type: ActionTypes.setParameterValue,
				payload: {
					normalized,
					parameter: paramName,
					value: paramValue
				}
			});
		}
	};

	const triggerMidiNoteEvent = (pitch: number, isNoteOn: boolean) => {
		let midiChannel = 0;
		let routeByte = (isNoteOn ? 144 : 128) + midiChannel;
		let velocityByte = (isNoteOn ? 100 : 0);
		let midiMessage = [ routeByte, pitch, velocityByte ];

		const address = `/rnbo/inst/0/midi/in`;
		const message = {
			address,
			args: midiMessage.map(byte => ({ type: "i", value: byte }))
		};
		const binary = writePacket(message);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(Buffer.from(binary));
		}
	};

	const sendListToInport = (name: string, values: number[]) => {
		const address = `/rnbo/inst/0/messages/in/${name}`;
		const message = {
			address,
			args: values.map(value => ({ type: "f", value }))
		};
		const binary = writePacket(message);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(Buffer.from(binary));
		}
	};

	useEffect(() => {

		const handleMessage = async (m) => {
			try {
				if (typeof m.data === "string") {
					const data = JSON.parse(m.data);
					dispatch({
						type: ActionTypes.updateDevice,
						payload: data
					});
				} else {
					const buf = await m.data.arrayBuffer();
					const message = readPacket(buf, {});
					handleOSCMessage(message);
				}
			} catch (e) {
				console.error(e);
			}
		};

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


	return <DeviceContext.Provider value={{
		connectionState,
		device,
		setParameterValueNormalized,
		triggerMidiNoteEvent,
		sendListToInport
	}}>
		{ children }
	</DeviceContext.Provider>
}

export const DeviceConsumer = DeviceContext.Consumer;
