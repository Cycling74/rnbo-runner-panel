import { createContext, useCallback, useEffect, useMemo } from "react";
import { writePacket, readPacket } from "osc";
import throttle from "lodash.throttle";
import { ParameterRecord } from "../models/parameter";
import { InportRecord } from "../models/inport";
import { EntityType } from "../reducers/entities";
import { deleteEntity, setEntity } from "../actions/entities";
import { useDispatch } from "react-redux";
import { initializeDevice, setParameterValue } from "../actions/device";
import { OSCQueryBridgeController } from "../controller/oscqueryBridgeController";

export type BridgeCallbacks = {
	setParameterValueNormalized: (name: string, value: number) => void,
	triggerMidiNoteEvent: (pitch: number, isNoteOn: boolean) => void,
	sendListToInport: (name: string, values: number[]) => void
};

export const DeviceContext = createContext<BridgeCallbacks>(null);

export type DeviceProviderProps = {
	bridge: OSCQueryBridgeController;
	children: any;
};

function handlePathAdded(path: string, dispatch: any, bridge: OSCQueryBridgeController)
{
	const matcher = /\/rnbo\/inst\/0\/(params|messages\/in)\/(\S+)/;
	let matches: string[];

	if ((matches = path.match(matcher))) {

		// Fetch new parameters
		if (matches[1] === "params" && !matches[2].endsWith("/normalized")) {
			bridge.ws.send(path);
		}

		// Inports can be declared with just a name
		else if (matches[1] === "messages/in") {
			dispatch(setEntity(EntityType.InportRecord, new InportRecord({ name: matches[2] })));
		}
	}
}

function handlePathRemoved(path: string, dispatch: any) {
	const matcher = /\/rnbo\/inst\/0\/(params|messages\/in)\/(\S+)/;
	let matches: string[];
	if ((matches = path.match(matcher))) {
		if (matches[1] === "params") {
			const paramPath = matches[2];
			if (!paramPath.endsWith("/normalized")) {
				dispatch(deleteEntity(EntityType.ParameterRecord, paramPath));
			}
		} else if (matches[1] === "messages/in") {
			const inPath = matches[2];
			dispatch(deleteEntity(EntityType.InportRecord, inPath));
		}
	}
};

function handleOSCMessage(packet: any, dispatch: any) {
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
		dispatch(setParameterValue(paramName, paramValue, normalized));
	}
};

export const DeviceProvider = ({bridge, children}: DeviceProviderProps) => {

	const dispatch = useDispatch();

	const setParameterValueNormalized = useMemo(
		() => {
			return throttle((name: string, value: number) => {
				const address = `/rnbo/inst/0/params/${name}/normalized`;
				const message = {
					address,
					args: [
						{ type: "f", value }
					]
				};
				const binary = writePacket(message);
				if (bridge.readyState === WebSocket.OPEN) {
					bridge.ws.send(Buffer.from(binary));
				}
			}, 100);
		},
		[bridge]
	);

	const triggerMidiNoteEvent = useCallback(
		(pitch: number, isNoteOn: boolean) => {
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
			if (bridge.readyState === WebSocket.OPEN) {
				bridge.ws.send(Buffer.from(binary));
			}
		},
		[bridge]
	);

	const sendListToInport = useCallback(
		(name: string, values: number[]) => {
			const address = `/rnbo/inst/0/messages/in/${name}`;
			const message = {
				address,
				args: values.map(value => ({ type: "f", value }))
			};
			const binary = writePacket(message);
			if (bridge.readyState === WebSocket.OPEN) {
				bridge.ws.send(Buffer.from(binary));
			}
		},
		[bridge]
	);

	const handleMessage = useMemo(() => {
		return async (m: any) => {
			try {
				if (typeof m.data === "string") {
					const data = JSON.parse(m.data);

					// brand new device
					if (typeof data.FULL_PATH === "string" &&
						data.FULL_PATH === "/rnbo/inst/0" &&
						(typeof data.CONTENTS !== "undefined"))
					{
						dispatch(initializeDevice(data));
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
							const params = ParameterRecord.arrayFromDescription(data, paramPath);
							if (params.length)
								dispatch(setEntity(EntityType.ParameterRecord, params[0]));
						}
					}

					else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_ADDED") {
						handlePathAdded(data.DATA, dispatch, bridge);
					} else if (typeof data.COMMAND === "string" && data.COMMAND === "PATH_REMOVED") {
						handlePathRemoved(data.DATA, dispatch);
					} else {
						// unhandled message
						// console.log("unhandled");
						// console.log(data);
					}


				} else {
					const buf = await m.data.arrayBuffer();
					const message = readPacket(buf, {});
					handleOSCMessage(message, dispatch);
				}
			} catch (e) {
				console.error(e);
			}
		}
	}, [dispatch, bridge]);

	useEffect(() => {
		bridge.addListener("message", handleMessage);
		return () => {
			bridge.removeListener("message", handleMessage);
		}
	}, [bridge, handleMessage]);

	return <DeviceContext.Provider value={{
		setParameterValueNormalized,
		triggerMidiNoteEvent,
		sendListToInport
	}}>
		{ children }
	</DeviceContext.Provider>
}

export const DeviceConsumer = DeviceContext.Consumer;
