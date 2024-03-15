import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useState } from "react";
import { faArrowRightArrowLeft, faMusic, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./instance.module.css";
import { InstanceTab } from "../../lib/constants";
import InstanceParameterTab from "./paramTab";
import InstanceMessagesTab from "./messageTab";
import InstanceMIDITab from "./midiTab";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { InstanceStateRecord } from "../../models/instance";

const tabs = [
	{ icon: faSliders, value: InstanceTab.Parameters, label: "Parameters" },
	{ icon: faArrowRightArrowLeft, value: InstanceTab.MessagePorts, label: "Ports" },
	{ icon: faMusic, value: InstanceTab.MIDI, label: "MIDI" }
];

export type InstanceProps = {
	instance: InstanceStateRecord;
	enabledMessageOuput: boolean;
	enabledMIDIKeyboard: boolean;
}

const Instance: FunctionComponent<InstanceProps> = memo(function WrappedInstance({
	instance,
	enabledMessageOuput,
	enabledMIDIKeyboard
}) {

	const [activeTab, setActiveTab] = useState<InstanceTab>(InstanceTab.Parameters);
	const isMobile = useIsMobileDevice();

	return (
		<Tabs
			className={ classes.instanceTabWrap }
			value={ activeTab }
			onChange={ t => setActiveTab(t as InstanceTab) }
			keepMounted={ false }
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
			<div className={ classes.instanceTabContentWrap } >
				<InstanceParameterTab instance={ instance } />
				<InstanceMessagesTab instance={ instance } outputEnabled={ enabledMessageOuput } />
				<InstanceMIDITab instance={ instance } keyboardEnabled={ enabledMIDIKeyboard } />
			</div>
		</Tabs>
	);
});

export default Instance;
