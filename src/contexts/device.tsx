import { createContext, useEffect, useReducer } from "react";
import { parse as parseQuery } from "querystring";
import { List, Map, OrderedMap } from "immutable";
import { writePacket, readPacket } from "osc";
import throttle from "lodash.throttle";
import { ParameterRecord } from "../models/parameter";
import { InportRecord } from "../models/inport";

export type AppContext = {
	connectionState: WebSocket["CLOSED"] | WebSocket["CLOSING"] | WebSocket["OPEN"] | WebSocket["CONNECTING"],
	parameters: OrderedMap<string, ParameterRecord>,
	inports: List<InportRecord>,
	setParameterValueNormalized: (name: string, value: number) => void,
	triggerMidiNoteEvent: (pitch: number, isNoteOn: boolean) => void,
	sendListToInport: (name: string, values: number[]) => void
};

export const DeviceContext = createContext<AppContext>(null);

const ActionTypes = {
	removeInport: "removeInport",
	removeParameter: "removeParameter",
	setConnectionState: "setConnectionState",
	setParameterValue: "setParameterValue",
	updateDevice: "updateDevice",
	updateInport: "updateInport",
	updateParameter: "updateParameter"
};

const reducer = (state: Map<string, any>, action) => {

	let parameterDescriptions = {};
	let inportDescriptions = {};

	switch (action.type) {

		case ActionTypes.removeInport:
			return state.set("inports", state.get("inports").filter((inportRecord => inportRecord.name !== action.payload.inport)));

		case ActionTypes.removeParameter:
			if (state.hasIn(["parameters", action.payload.parameter]))
				return state.deleteIn(["parameters", action.payload.parameter]);
			break;

		case ActionTypes.setConnectionState:
			return state.set("connectionState", action.payload.connectionState);

		case ActionTypes.setParameterValue:
			const parameterProperty = action.payload.normalized ? "normalizedValue" : "value";
			if (state.hasIn(["parameters", action.payload.parameter]))
				return state.setIn(["parameters", action.payload.parameter, parameterProperty], action.payload.value);
			break;

		case ActionTypes.updateDevice:
			let desc = action.payload;
			try {
				parameterDescriptions = (desc as any).CONTENTS.params;
				inportDescriptions = (desc as any).CONTENTS.messages.CONTENTS.in;
			} catch (e) {}
			return state
				.set("parameters", ParameterRecord.mapFromParamDescription(parameterDescriptions))
				.set("inports", InportRecord.listFromPortDescription(inportDescriptions));

		case ActionTypes.updateInport:
			return state.set("inports", state.get("inports").push(
				new InportRecord({ name: action.payload.inport })
			));

		case ActionTypes.updateParameter:
			return state.mergeIn(
				["parameters"],
				ParameterRecord.mapFromParamDescription(
					action.payload.description,
					action.payload.name
				)
			);

		default:
			return state;
	}

	return state;
};

const initState = () => {
	return Map<string, any>(new Array(
		["connectionState", WebSocket.CLOSED],
		["parameters", OrderedMap<string, ParameterRecord>()],
		["inports", List<InportRecord>()]
	));
};

let { wsport } = parseQuery(location.search?.slice(1));
if (!wsport || process.env.NODE_ENV === "development") wsport = "5678";
const wsurl = `ws://${location.hostname}:${wsport}`;

const ws = new WebSocket(wsurl);

const setParameterValueNormalized = throttle((name: string, value: number) => {
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
}, 100);

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

export const DeviceProvider = ({children}) => {

	const [state, dispatch] = useReducer(reducer, null, initState);
	const connectionState = state.get("connectionState");
	const parameters = state.get("parameters");
	const inports = state.get("inports");

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

	const handlePathAdded = (path: string) => {
		const matcher = /\/rnbo\/inst\/0\/(params|messages\/in)\/(\S+)/;
		let matches: string[];

		console.log(path);

		if ((matches = path.match(matcher))) {

			// Fetch new parameters
			if (matches[1] === "params" && !matches[2].endsWith("/normalized")) {
				ws.send(path);
			}

			// Inports can be declared with just a name
			else if (matches[1] === "messages/in") {
				dispatch({
					type: ActionTypes.updateInport,
					payload: {
						inport: matches[2]
					}
				});
			}
		}
	}

	const handlePathRemoved = (path: string) => {
		const matcher = /\/rnbo\/inst\/0\/(params|messages\/in)\/(\S+)/;
		let matches: string[];
		if ((matches = path.match(matcher))) {
			if (matches[1] === "params") {
				const paramPath = matches[2];
				if (!paramPath.endsWith("/normalized")) {
					dispatch({
						type: ActionTypes.removeParameter,
						payload: {
							parameter: paramPath
						}
					});
				}
			} else if (matches[1] === "messages/in") {
				const inPath = matches[2];
				dispatch({
					type: ActionTypes.removeInport,
					payload: {
						inport: inPath
					}
				});
			}
		}
	};

	useEffect(() => {

		const handleMessage = async (m) => {
			try {
				if (typeof m.data === "string") {
					const data = JSON.parse(m.data);

					// brand new device
					if (typeof data.FULL_PATH === "string" &&
						data.FULL_PATH === "/rnbo/inst/0" &&
						(typeof data.CONTENTS !== "undefined"))
					{
						dispatch({
							type: ActionTypes.updateDevice,
							payload: data
						});
					}

					// individual parameter
					else if (typeof data.FULL_PATH === "string" &&
						data.FULL_PATH.startsWith("/rnbo/inst/0/params"))
					{
						const paramMatcher = /\/rnbo\/inst\/0\/params\/(\S+)/;
						let matches: string[];

						// If it's a new parameter, fetch its data
						if ((matches = data.FULL_PATH.match(paramMatcher))) {
							const paramPath = matches[1];
							dispatch({
								type: ActionTypes.updateParameter,
								payload: {
									name: paramPath,
									description: data
								}
							});
						}
					}

					// individual inport
					else if (typeof data.FULL_PATH === "string" &&
						data.FULL_PATH.startsWith("/rnbo/inst/0/in"))
					{
						const paramMatcher = /\/rnbo\/inst\/0\/params\/(\S+)/;
						let matches: string[];

						// If it's a new parameter, fetch its data
						if ((matches = data.FULL_PATH.match(paramMatcher))) {
							const paramPath = matches[1];
							dispatch({
								type: ActionTypes.updateParameter,
								payload: {
									name: paramPath,
									description: data
								}
							});
						}
					}

					else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_ADDED") {
						handlePathAdded(data.DATA);
					} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_REMOVED") {
						handlePathRemoved(data.DATA);
					} else {
						// unhandled message
						// console.log("unhandled");
						// console.log(data);
					}


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
		parameters,
		inports,
		setParameterValueNormalized,
		triggerMidiNoteEvent,
		sendListToInport
	}}>
		{ children }
	</DeviceContext.Provider>
}

export const DeviceConsumer = DeviceContext.Consumer;
