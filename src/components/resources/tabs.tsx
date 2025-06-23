import { memo, useCallback, useState } from "react";
import { ResourceTab } from "../../lib/constants";
import { Tabs, Text } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { DataFileManagementView } from "../datafile/managementView";
import { PatcherManagementView } from "../patchers/managementView";
import { mdiFileExport, mdiFileMusic, mdiGroup } from "@mdi/js";
import styles from "./tabs.module.css";
import SetManagementView from "../sets/managementView";

const tabs = [
	{ icon: mdiGroup, value: ResourceTab.Graphs, label: "Graphs" },
	{ icon: mdiFileExport, value: ResourceTab.Patchers, label: "Patchers" },
	{ icon: mdiFileMusic, value: ResourceTab.AudioFiles, label: "Audio Files" }
];

export const ResourceTabs = memo(function WrappedResourceTabs() {

	const [activeTab, setActiveTab] = useState<ResourceTab>(ResourceTab.Graphs);
	const onChangeTab = useCallback((v: ResourceTab) => setActiveTab(v), [setActiveTab]);

	return (
		<div className={ styles.wrapper } >
			<Tabs value={ activeTab } onChange={ onChangeTab } h="100%" >
				<Tabs.List grow>
					{
						tabs.map(info => (
							<Tabs.Tab key={ info.value } value={ info.value } leftSection={ <IconElement path={ info.icon } /> } >
								<Text fz="sm" className={ styles.tabLabel } >{ info.label }</Text>
							</Tabs.Tab>
						))
					}
				</Tabs.List>
				<div className={ styles.tabContent } >
					<Tabs.Panel value={ ResourceTab.AudioFiles } >
						<DataFileManagementView />
					</Tabs.Panel>
					<Tabs.Panel value={ ResourceTab.Graphs }>
						<SetManagementView />
					</Tabs.Panel>
					<Tabs.Panel value={ ResourceTab.Patchers }>
						<PatcherManagementView />
					</Tabs.Panel>
				</div>
			</Tabs>
		</div>
	);
});
