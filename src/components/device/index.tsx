import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useState } from "react";
import { faArrowRightArrowLeft, faMusic, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GraphPatcherNodeRecord } from "../../models/graph";
import classes from "./device.module.css";
import { DeviceTab } from "../../lib/constants";
import DeviceParameterTab from "./paramTab";
import DeviceMessagesTab from "./messageTab";
import DeviceMIDITab from "./midiTab";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";

const tabs = [
	{ icon: faSliders, value: DeviceTab.Parameters, label: "Parameters" },
	{ icon: faArrowRightArrowLeft, value: DeviceTab.MessagePorts, label: "Messages" },
	{ icon: faMusic, value: DeviceTab.MIDI, label: "MIDI" }
];

export type DeviceInstanceProps = {
	device: GraphPatcherNodeRecord;
	enabledMessageOuput: boolean;
}

const DeviceInstance: FunctionComponent<DeviceInstanceProps> = memo(function WrappedDeviceInstance({
	device,
	enabledMessageOuput
}) {

	const [activeTab, setActiveTab] = useState<DeviceTab>(DeviceTab.Parameters);
	const isMobile = useIsMobileDevice();

	return (
		<Tabs
			className={ classes.deviceTabWrap }
			value={ activeTab }
			onChange={ t => setActiveTab(t as DeviceTab) }
		>
			<Tabs.List grow={ isMobile } >
				{
					tabs.map(({ icon, label, value }) => (
						<Tabs.Tab key={ value } value={ value } leftSection={ <FontAwesomeIcon icon={ icon } /> } >
							{ label }
						</Tabs.Tab>
					))
				}
			</Tabs.List>
			<div className={ classes.deviceTabContentWrap } >
				<DeviceParameterTab device={ device } />
				<DeviceMessagesTab device={ device } outputEnabled={ enabledMessageOuput } />
				<DeviceMIDITab device={ device } />
			</div>
		</Tabs>
	);
});

export default DeviceInstance;
