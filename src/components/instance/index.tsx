import { Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useEffect, useState } from "react";
import { faArrowRightArrowLeft, faMusic, faSliders, faFileAudio } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./instance.module.css";
import { InstanceTab } from "../../lib/constants";
import InstanceParameterTab from "./paramTab";
import InstanceMessagesTab from "./messageTab";
import InstanceMIDITab from "./midiTab";
import InstanceDataRefsTab from "./datarefTab";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { InstanceStateRecord } from "../../models/instance";
import { AppSettingRecord } from "../../models/settings";
import { DataFileRecord } from "../../models/datafile";
import { Seq } from "immutable";

const tabs = [
	{ icon: faSliders, value: InstanceTab.Parameters, label: "Parameters" },
	{ icon: faArrowRightArrowLeft, value: InstanceTab.MessagePorts, label: "Ports" },
	{ icon: faFileAudio, value: InstanceTab.DataRefs, label: "Buffers" },
	{ icon: faMusic, value: InstanceTab.MIDI, label: "MIDI" }
];

export type InstanceProps = {
	instance: InstanceStateRecord;
	datafiles: Seq.Indexed<DataFileRecord>
	enabledMessageOuput: AppSettingRecord;
	enabledMIDIKeyboard: AppSettingRecord;
	paramSortOrder: AppSettingRecord;
	paramSortAttr: AppSettingRecord;
}

const Instance: FunctionComponent<InstanceProps> = memo(function WrappedInstance({
	instance,
	datafiles,
	enabledMessageOuput,
	enabledMIDIKeyboard,
	paramSortOrder,
	paramSortAttr
}) {

	const [activeTab, setActiveTab] = useState<InstanceTab>(InstanceTab.Parameters);
	const isMobile = useIsMobileDevice();

	useEffect(() => {
		if (document.activeElement && document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}, [activeTab]);

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
							<Text fz="sm" className={ classes.tabLabel } >{ label }</Text>
						</Tabs.Tab>
					))
				}
			</Tabs.List>
			<div className={ classes.instanceTabContentWrap } >
				<InstanceParameterTab instance={ instance } sortAttr={ paramSortAttr } sortOrder={ paramSortOrder } isMIDIMapping={ instance.waitingForMidiMapping } />
				<InstanceMessagesTab instance={ instance } outputEnabled={ enabledMessageOuput.value as boolean } />
				<InstanceDataRefsTab instance={ instance } datafiles={ datafiles } />
				<InstanceMIDITab instance={ instance } keyboardEnabled={ enabledMIDIKeyboard.value as boolean } />
			</div>
		</Tabs>
	);
});

export default Instance;
