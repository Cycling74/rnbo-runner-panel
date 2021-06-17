import { useContext } from "react";
import Overlay from "./Overlay";
import Parameter from "./Parameter";
import { DeviceContext } from "../contexts/device";
import { ParameterRecord } from "../models/parameter";
import { List } from "immutable";

export default function Device() {

	const {connectionState, device, setParameterValueNormalized} = useContext(DeviceContext);

	const connectionString = connectionState !== WebSocket.OPEN ? "Not connected" : "Connected";

	const onSetValue = () => {
		setParameterValueNormalized
	}

	const parameters = !device ? List<ParameterRecord>() : device.parameters.map(parameter => {
		const onSetValue = (value: number) => {
			setParameterValueNormalized(parameter.name, value);
		};
		return <Parameter key={parameter.name} record={parameter} onSetValue={onSetValue} />
	});

	return (
		<>
			<h1>This is a device</h1>
			<Overlay status={connectionString}/>
			{parameters.toArray()}
		</>
	)
}
