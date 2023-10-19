import { Stack } from "@mantine/core";
import { FunctionComponent, memo } from "react";
import { Setting, SettingsValue } from "../../reducers/settings";
import SettingsItem, { SettingsType } from "./item";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getSettings } from "../../selectors/settings";
import { setSetting } from "../../actions/settings";

const SettingsList: FunctionComponent = memo(function SettingsWrapper() {

	const settings = useAppSelector((state: RootStateType) => getSettings(state));
	const dispatch = useAppDispatch();

	const onChangeSetting = (name: Setting, value: SettingsValue) => dispatch(setSetting(name, value));

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
		</Stack>
	);
});

export default SettingsList;
