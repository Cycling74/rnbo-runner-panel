import { memo, useCallback, useState } from "react";
import { ResourceType } from "../../lib/constants";
import { Tabs, Text } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { DataFileManagementView } from "../datafile/managementView";
import { PatcherManagementView } from "../patchers/managementView";
import { mdiFileExport, mdiFileMusic, mdiGroup } from "@mdi/js";
import styles from "./tabs.module.css";
import SetManagementView from "../sets/managementView";

const tabs = [
	{ icon: mdiGroup, value: ResourceType.Set, label: "Graphs" },
	{ icon: mdiFileExport, value: ResourceType.Patcher, label: "Patchers" },
	{ icon: mdiFileMusic, value: ResourceType.DataFile, label: "Audio Files" }
];

export const ResourceTabs = memo(function WrappedResourceTabs() {

	const [activeTab, setActiveTab] = useState<ResourceType>(ResourceType.Set);
	const onChangeTab = useCallback((v: ResourceType) => setActiveTab(v), [setActiveTab]);

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
					<Tabs.Panel value={ ResourceType.DataFile } >
						<DataFileManagementView />
					</Tabs.Panel>
					<Tabs.Panel value={ ResourceType.Set }>
						<SetManagementView />
					</Tabs.Panel>
					<Tabs.Panel value={ ResourceType.Patcher }>
						<PatcherManagementView />
					</Tabs.Panel>
				</div>
			</Tabs>
		</div>
	);
});
