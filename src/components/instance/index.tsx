import { Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useEffect, useState } from "react";
import classes from "./instance.module.css";
import { InstanceTab } from "../../lib/constants";
import InstanceParameterTab from "./paramTab";
import InstanceMessagesTab from "./messageTab";
import InstanceDataRefsTab from "./datarefTab";
import { InstanceStateRecord } from "../../models/instance";
import { AppSettingRecord } from "../../models/settings";
import { DataFileRecord } from "../../models/datafile";
import { Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiFileMusic, mdiSwapHorizontal, mdiTune } from "@mdi/js";

const tabs = [
	{ icon: mdiTune, value: InstanceTab.Parameters, label: "Parameters" },
	{ icon: mdiSwapHorizontal, value: InstanceTab.MessagePorts, label: "Ports" },
	{ icon: mdiFileMusic, value: InstanceTab.DataRefs, label: "Buffers" }
];

export type InstanceProps = {
	instance: InstanceStateRecord;
	datafiles: Seq.Indexed<DataFileRecord>
	enabledMessageOuput: AppSettingRecord;
	paramSortOrder: AppSettingRecord;
	paramSortAttr: AppSettingRecord;
}

const Instance: FunctionComponent<InstanceProps> = memo(function WrappedInstance({
	instance,
	datafiles,
	enabledMessageOuput,
	paramSortOrder,
	paramSortAttr
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
					<InstanceParameterTab instance={ instance } sortAttr={ paramSortAttr } sortOrder={ paramSortOrder } />
				</Tabs.Panel>
				<Tabs.Panel value={ InstanceTab.MessagePorts } >
					<InstanceMessagesTab instance={ instance } outputEnabled={ enabledMessageOuput.value as boolean } />
				</Tabs.Panel>
				<Tabs.Panel value={ InstanceTab.DataRefs } >
					<InstanceDataRefsTab instance={ instance } datafiles={ datafiles } />
				</Tabs.Panel>
			</div>
		</Tabs>
	);
});

export default Instance;
