import { Button, Group, Modal, Stack, Tabs, Text } from "@mantine/core";
import SettingsList from "./list";
import { FunctionComponent, memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getSettingsItemsForTab, getShowSettingsModal } from "../../selectors/settings";
import { hideSettings, setAppSetting, setRunnerConfig, updateRunnerAudio } from "../../actions/settings";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { SettingTarget, SettingsTab } from "../../lib/constants";
import { IconDefinition, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { SettingsItemType, SettingsItemValue } from "./item";
import { AppSetting, AppSettingRecord, AppSettingType } from "../../models/settings";
import { ConfigKey, ConfigRecord } from "../../models/config";
import { OSCQueryValueType } from "../../lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AboutInfo from "../page/about";

type TabAction = {
	action: () => any;
	icon?: IconDefinition;
	label: string;
};

type TabConfig = {
	actions?: Array<TabAction>;
	description?: string;
	title: string;
};

const tabConfigByTab: Record<SettingsTab, TabConfig> = {
	[SettingsTab.UI]: {
		title: "UI",
		description: "UI settings are device scoped, saved to the local storage and restored on page load."
	},
	[SettingsTab.Control]: {
		title: "Control"
	},
	[SettingsTab.Instance]: {
		title: "Instance"
	},
	[SettingsTab.Audio]: {
		title: "Audio",
		actions: [{ action: updateRunnerAudio, label: "Update Audio", icon: faRotateRight }]
	}
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
			return SettingsItemType.Select;
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

const Settings: FunctionComponent = memo(function WrappedSettings() {

	const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.UI);

	const showFullScreen = useIsMobileDevice();
	const [
		doShowSettings,
		settingsItems
	] = useAppSelector((state: RootStateType) => [
		getShowSettingsModal(state),
		getSettingsItemsForTab(state, activeTab)
	]);

	const dispatch = useAppDispatch();
	const onCloseModal = () => dispatch(hideSettings());

	const onChangeTab = useCallback((tab: SettingsTab) => setActiveTab(tab), [setActiveTab]);
	const onChangeSetting = useCallback(( target: SettingTarget, id: AppSetting | ConfigKey, value: SettingsItemValue) => {

		if (target === SettingTarget.App) {
			return void dispatch(setAppSetting(id as AppSetting, value));
		} else if (target === SettingTarget.Runner) {
			return void dispatch(setRunnerConfig(id as ConfigKey, value));
		}
	}, [dispatch]);


	return (
		<Modal
			onClose={ onCloseModal }
			opened={ doShowSettings }
			fullScreen={ showFullScreen }
			size="xl"
			title="Settings"
		>
			<Tabs value={ activeTab } onChange={ onChangeTab } keepMounted={ false } >
				<Stack gap="md">
					<Tabs.List grow>
						{
							Object.values(SettingsTab).map(id => (
								<Tabs.Tab key={ id } value={ id } >{ tabConfigByTab[id].title }</Tabs.Tab>
							))
						}
					</Tabs.List>
					{
						Object.values(SettingsTab).map(id => (
							<Tabs.Panel key={ id } value={ id } >
								<Stack gap="sm">
									{
										tabConfigByTab[id].description?.length ? (
											<Text fz="xs" fs="italic">{ tabConfigByTab[id].description }</Text>
										) : null
									}
									<SettingsList
										items={
											(id === activeTab ? settingsItems : []).map(item => {
												return item instanceof AppSettingRecord
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
													});
											})
										}
									/>
									{
										tabConfigByTab[id].actions?.length ? (
											<Group justify="flex-end">
												{
													tabConfigByTab[id].actions.map((info, i) => (
														<Button
															key={ i }
															variant="default"
															onClick={ () => dispatch(info.action()) }
															leftSection={ info.icon ? <FontAwesomeIcon icon={ info.icon } /> : null }
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
						))
					}
				</Stack>
			</Tabs>
			<AboutInfo />
		</Modal>
	);
});

export default Settings;
