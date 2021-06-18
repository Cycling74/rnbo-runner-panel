import { useContext } from "react";
import Overlay from "./Overlay";
import Parameter from "./Parameter";
import { DeviceContext } from "../contexts/device";
import { ParameterRecord } from "../models/parameter";
import { List, OrderedMap } from "immutable";

export default function Device() {

	const {connectionState, device, setParameterValueNormalized} = useContext(DeviceContext);

	const connectionString = connectionState !== WebSocket.OPEN ? "Not connected" : "Connected";

	const parameters = !device ? OrderedMap<string, ParameterRecord>() : device.parameters.map(parameter => {
		const onSetValue = (value: number) => {
			setParameterValueNormalized(parameter.name, value);
		};
		return <Parameter key={parameter.name} record={parameter} onSetValue={onSetValue} />
	});

	return (
		<>
			<h1>This is a device</h1>
			<Overlay status={connectionString}/>
			{parameters.valueSeq()}
		</>
	)
}
