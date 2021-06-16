import { useContext } from "react";
import Overlay from "./Overlay";
import Parameter from "./Parameter";
import { DeviceContext } from "../contexts/device";

export default function Device() {

	const deviceState = useContext(DeviceContext);

	const connectionString = deviceState.connectionState !== WebSocket.OPEN ? "Not connected" : "Connected";

	return (
		<>
			<h1>This is a device</h1>
			<Overlay status={connectionString}/>
			<Parameter />
		</>
	)
}
