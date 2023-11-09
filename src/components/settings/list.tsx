import { Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { Setting, SettingsValue } from "../../reducers/settings";
import { SettingsItem, SettingsType, ConfigItem, ConfigType } from "./item";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getSettings } from "../../selectors/settings";
import { setSetting } from "../../actions/settings";
import { getConfig } from "../../selectors/config";
import { updateConfig, updateIntConfig } from "../../actions/config";
import { ConfigBase, ConfigValueType } from "../../models/config";

const SettingsList: FunctionComponent = memo(function SettingsWrapper() {

	const [settings, config] = useAppSelector((state: RootStateType) => [getSettings(state), getConfig(state)]);
	const dispatch = useAppDispatch();

	const onChangeSetting = (name: Setting, value: SettingsValue) => dispatch(setSetting(name, value));
	const onChangeConfig = useCallback((base: ConfigBase, key: string, value: ConfigValueType) => {
		dispatch(updateConfig(base, key, value));
	}, [dispatch]);
	const onChangeIntConfig = (base: ConfigBase, key: string, value: number) => dispatch(updateIntConfig(base, key, value));

	return (
		<Stack gap="sm">
			<SettingsItem
				name={ Setting.colorScheme }
				onChange={ onChangeSetting }
				options={ ["light", "dark"] }
				title="Color Scheme"
				type={ SettingsType.Switch }
				value={ settings[Setting.colorScheme] as string }
			/>
			<SettingsItem
				name={ Setting.debugMessageOutput }
				onChange={ onChangeSetting }
				title="Debug Message Output"
				type={ SettingsType.OnOff }
				value={ settings[Setting.debugMessageOutput] as boolean }
			/>
			<ConfigItem
				name={ "control_auto_connect_midi" }
				base= { ConfigBase.Base }
				onChange={ onChangeConfig }
				title="Auto Connect App Control MIDI"
				type={ ConfigType.OnOff }
				value={ config["control_auto_connect_midi"] }
			/>
		</Stack>
	);
});

export default SettingsList;
