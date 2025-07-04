import { Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useEffect, useState } from "react";
import classes from "./instance.module.css";
import { InstanceTab } from "../../lib/constants";
import InstanceParameterTab from "./paramTab";
import InstanceInportTab from "./inportTab";
import InstanceOutportTab from "./outportTab";
import InstanceDataRefsTab from "./datarefTab";
import { PatcherInstanceRecord } from "../../models/instance";
import { AppSettingRecord } from "../../models/settings";
import { DataFileRecord } from "../../models/datafile";
import { Map as ImmuMap, Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiExport, mdiFileMusic, mdiImport, mdiTune } from "@mdi/js";
import { ParameterRecord } from "../../models/parameter";
import { MessagePortRecord } from "../../models/messageport";
import { DataRefRecord } from "../../models/dataref";

const tabs = [
	{ icon: mdiTune, value: InstanceTab.Parameters, label: "Parameters" },
	{ icon: mdiImport, value: InstanceTab.Inports, label: "Inports" },
	{ icon: mdiExport, value: InstanceTab.Outports, label: "Outports" },
	{ icon: mdiFileMusic, value: InstanceTab.DataRefs, label: "Buffers" }
];

export type InstanceProps = {
	instance: PatcherInstanceRecord;
	datafiles: Seq.Indexed<DataFileRecord>
	dataRefs: ImmuMap<DataRefRecord["id"], DataRefRecord>;
	enabledMessageOuput: AppSettingRecord;
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	paramThumbSize: AppSettingRecord;
	paramTrackSize: AppSettingRecord;
	paramSortOrder: AppSettingRecord;
	paramSortAttr: AppSettingRecord;
}

const Instance: FunctionComponent<InstanceProps> = memo(function WrappedInstance({
	instance,
	datafiles,
	dataRefs,
	enabledMessageOuput,
	messageInports,
	messageOutports,
	parameters,
	paramSortOrder,
	paramSortAttr,
	paramThumbSize,
	paramTrackSize
}) {

	const [activeTab, setActiveTab] = useState<InstanceTab>(InstanceTab.Parameters);

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
			<Tabs.List grow>
				{
					tabs.map(({ icon, label, value }) => (
						<Tabs.Tab key={ value } value={ value } leftSection={ <IconElement path={ icon } /> } >
							<Text fz="sm" className={ classes.tabLabel } >{ label }</Text>
						</Tabs.Tab>
					))
				}
			</Tabs.List>
			<div className={ classes.instanceTabContentWrap } >
				<Tabs.Panel value={ InstanceTab.Parameters } >
					<InstanceParameterTab
						instance={ instance }
						parameters={ parameters }
						thumbSize={ paramThumbSize }
						trackSize={ paramTrackSize }
						sortAttr={ paramSortAttr }
						sortOrder={ paramSortOrder }
					/>
				</Tabs.Panel>
				<Tabs.Panel value={ InstanceTab.Inports } >
					<InstanceInportTab instance={ instance } messageInports={ messageInports } />
				</Tabs.Panel>
				<Tabs.Panel value={ InstanceTab.Outports } >
					<InstanceOutportTab instance={ instance } messageOutports={ messageOutports } outputEnabled={ enabledMessageOuput.value as boolean } />
				</Tabs.Panel>
				<Tabs.Panel value={ InstanceTab.DataRefs } >
					<InstanceDataRefsTab instance={ instance } datafiles={ datafiles } dataRefs={ dataRefs } />
				</Tabs.Panel>
			</div>
		</Tabs>
	);
});

export default Instance;
