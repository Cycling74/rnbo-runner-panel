import { Anchor, Button, Group, Modal, Stack, Tabs, Text } from "@mantine/core";
import SettingsList from "./list";
import { FunctionComponent, memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getRunnerOwnsJackServer, getSettingsItemsForTab, getShowSettingsModal } from "../../selectors/settings";
import { hideSettings, setAppSetting, setRunnerConfig, updateRunnerAudio } from "../../actions/settings";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { SettingTarget, SettingsTab } from "../../lib/constants";
import { SettingActionProps, SettingsItemType, SettingsItemValue } from "./item";
import { AppSetting, AppSettingRecord, AppSettingType } from "../../models/settings";
import { ConfigKey, ConfigRecord } from "../../models/config";
import { OSCQueryValueType } from "../../lib/types";
import AboutInfo from "../page/about";
import classes from "./settings.module.css";
import { IconElement } from "../elements/icon";
import { mdiArrowLeft, mdiRestart } from "@mdi/js";

type TabConfig = {
	actions?: Array<SettingActionProps>;
	description?: string;
	title: string;
};

const settingUITypeByAppSettingType: Record<AppSettingType, SettingsItemType> = {
	[AppSettingType.Boolean]: SettingsItemType.OnOff,
	[AppSettingType.String]: SettingsItemType.Select,
	[AppSettingType.Switch]: SettingsItemType.Switch
};

const getSettingUITypeForConfig = (config: ConfigRecord): SettingsItemType => {
	if (config.options?.length) {
		return SettingsItemType.Select;
	}

	switch (config.oscType) {
		case OSCQueryValueType.String:
			return config.options ? SettingsItemType.Select : SettingsItemType.Text;
		case OSCQueryValueType.True:
		case OSCQueryValueType.False:
			return SettingsItemType.OnOff;
		case OSCQueryValueType.Int32:
		case OSCQueryValueType.Float32:
		case OSCQueryValueType.Double64:
		default:
			return SettingsItemType.Numeric;
	}
};

type SettingsTabPanelProps = TabConfig & {
	id: SettingsTab;
	items: (ConfigRecord | AppSettingRecord)[];
};


const SettingsTabPanel: FunctionComponent<SettingsTabPanelProps> = memo(function WrappedSettingsTabPanel({
	id,
	actions,
	description,
	items
}) {

	const dispatch = useAppDispatch();
	const onChangeSetting = useCallback(( target: SettingTarget, id: AppSetting | ConfigKey, value: SettingsItemValue) => {

		if (target === SettingTarget.App) {
			return void dispatch(setAppSetting(id as AppSetting, value));
		} else if (target === SettingTarget.Runner) {
			return void dispatch(setRunnerConfig(id as ConfigKey, value));
		}
	}, [dispatch]);

	return (
		<Tabs.Panel value={ id } >
			<Stack gap="sm">
				{
					description?.length ? (
						<p className={ classes.tabDescription } >{ description }</p>
					) : null
				}
				<SettingsList
					items={
						items.map(item => item instanceof AppSettingRecord
							? ({
								description: item.description,
								name: item.id,
								options: item.options,
								onChange: onChangeSetting,
								target: SettingTarget.App,
								title: item.title,
								type: settingUITypeByAppSettingType[item.type],
								value: item.value
							})
							: ({
								description: item.description,
								max: item.max,
								min: item.min,
								name: item.id,
								onChange: onChangeSetting,
								options: item.options?.map(o => typeof o !== "string" ? `${o}` : o),
								target: SettingTarget.Runner,
								title: item.title,
								type: getSettingUITypeForConfig(item),
								value: item.value
							})
						)
					}
				/>
				{
					actions?.length ? (
						<Group justify="flex-end">
							{
								actions.map((info, i) => (
									<Button
										key={ i }
										variant="outline"
										c="blue.6"
										onClick={ () => dispatch(info.action()) }
										leftSection={ info.icon ? <IconElement path={ info.icon } /> : null }
									>
										{ info.label }
									</Button>
								))
							}
						</Group>
					) : null
				}
			</Stack>
		</Tabs.Panel>
	);
});

const Settings: FunctionComponent = memo(function WrappedSettings() {

	const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.UI);
	const [showAbout, setShowAbout] = useState<boolean>(false);
	const dispatch = useAppDispatch();

	const showFullScreen = useIsMobileDevice();

	const [
		doShowSettings,
		ownsJackServer,
		settingsItems
	] = useAppSelector((state: RootStateType) => [
		getShowSettingsModal(state),
		getRunnerOwnsJackServer(state),
		getSettingsItemsForTab(state, activeTab)
	]);

	const onCloseSettingsModal = useCallback(() => {
		dispatch(hideSettings());
		setTimeout(() => setShowAbout(false), 300);
	}, [dispatch, setShowAbout]);

	const onChangeSettingsTab = useCallback((tab: SettingsTab) => setActiveTab(tab), [setActiveTab]);

	const onOpenAbout = useCallback(() => setShowAbout(true), [setShowAbout]);
	const onCloseAbout = useCallback(() => setShowAbout(false), [setShowAbout]);

	const tabConfigByTab: Record<SettingsTab, TabConfig> = {
		[SettingsTab.UI]: {
			title: "UI",
			description: "UI settings are scoped to the device you are currently using the Web Interface on and restored on page load."
		},
		[SettingsTab.Control]: {
			title: "Control"
		},
		[SettingsTab.Instance]: {
			title: "Graph"
		},
		[SettingsTab.Audio]: {
			title: "Audio",
			actions: [
				{
					action: updateRunnerAudio,
					description: "Restarts the Jack Server with the updated configuration",
					icon: mdiRestart,
					label: "Apply Configuration"
				}
			]
		}
	};

	return (
		<Modal
			onClose={ onCloseSettingsModal }
			opened={ doShowSettings }
			fullScreen={ showFullScreen }
			size="xl"
			title={ showAbout ? "About" : "Settings" }
		>
			{
				showAbout ? (
					<Stack gap="md">
						<Group>
							<Button onClick={ onCloseAbout } size="xs" variant="outline" leftSection={ <IconElement path={ mdiArrowLeft }  /> } >
								Back to Settings
							</Button>
						</Group>
						<AboutInfo />
					</Stack>
				) : (
					<>
						<Tabs value={ activeTab } onChange={ onChangeSettingsTab } keepMounted={ false } >
							<Stack gap="md">
								<Tabs.List grow>
									{
										Object.values(SettingsTab).map(id => (
											<Tabs.Tab key={ id } value={ id } >
												<Text fz={{ base: "sm", sm: "md" }} lh={{ base: "sm", sm: "md" }}>
													{ tabConfigByTab[id].title }
												</Text>
											</Tabs.Tab>
										))
									}
								</Tabs.List>
								<SettingsTabPanel
									id={ SettingsTab.Audio}
									items={ activeTab === SettingsTab.Audio ? settingsItems : [] }
									actions={ ownsJackServer ? tabConfigByTab[SettingsTab.Audio].actions : [] }
									description={ ownsJackServer ? tabConfigByTab[SettingsTab.Audio].description : "Audio Settings are not available as the runner is not the owner of the Jack server and its configuration." }
									title={ tabConfigByTab[SettingsTab.Audio].title }
								/>
								<SettingsTabPanel
									id={ SettingsTab.Control}
									items={ activeTab === SettingsTab.Control ? settingsItems : [] }
									{ ...tabConfigByTab[SettingsTab.Control] }
								/>
								<SettingsTabPanel
									id={ SettingsTab.Instance}
									items={ activeTab === SettingsTab.Instance ? settingsItems : [] }
									{ ...tabConfigByTab[SettingsTab.Instance] }
								/>
								<SettingsTabPanel
									id={ SettingsTab.UI}
									items={ activeTab === SettingsTab.UI ? settingsItems : [] }
									{ ...tabConfigByTab[SettingsTab.UI] }
								/>
							</Stack>
						</Tabs>
						<Group mt="xl" justify="center">
							<Anchor onClick={ onOpenAbout } c="dimmed" fz="xs" underline="always">
								About
							</Anchor>
						</Group>
					</>
				)
			}
		</Modal>
	);
});

export default Settings;
