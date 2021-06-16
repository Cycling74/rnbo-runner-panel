import Device from '../components/Device'
import { DeviceProvider } from "../contexts/device";

export default function Root() {
	return (
		<DeviceProvider>
			<Device />
		</DeviceProvider>
	)
}
