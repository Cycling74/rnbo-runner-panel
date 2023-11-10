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
import { ConfigBase, ConfigValue, ConfigOptions, CONFIG_PROPS, ConfigValueType, ConfigProps, JackConfigProps, InstanceConfigProps } from "../../models/config";

const SettingsList: FunctionComponent = memo(function SettingsWrapper() {

	const [settings, config] = useAppSelector((state: RootStateType) => [getSettings(state), getConfig(state)]);
	const dispatch = useAppDispatch();

	const onChangeSetting = (name: Setting, value: SettingsValue) => dispatch(setSetting(name, value));
	const onChangeConfig = useCallback((base: ConfigBase, key: string, value: ConfigValue) => {
		dispatch(updateConfig(base, key, value));
	}, [dispatch]);
	const onChangeIntConfig = useCallback((base: ConfigBase, key: string, value: number) => {
		dispatch(updateIntConfig(base, key, value));
	}, [dispatch]);

	const getValue = <Key, >(base: ConfigBase, key: Key, options_key?: Key) : [ConfigValue | null, string[] | null] => {
		switch (base) {
			case ConfigBase.Base:
			return [
				config.config[key as keyof ConfigProps] as ConfigValue,
				(options_key ? config.config[options_key as keyof ConfigProps] as string[] : null)
			];
			case ConfigBase.Jack:
			return [
				config.jack[key as keyof JackConfigProps] as ConfigValue,
				(options_key ? config.jack[options_key as keyof JackConfigProps] as string[] : null)
			];
			case ConfigBase.Instance:
			return [
				config.instance[key as keyof InstanceConfigProps] as ConfigValue,
				(options_key ? config.instance[options_key as keyof InstanceConfigProps] as string[] : null)
			];
		}
		return [null, null];
	}

	//filte appropriate props
	const configProps = [];
	for (const [base, entries] of Object.entries(CONFIG_PROPS)) {
		for (const e of entries) {
			const [v, o] = getValue(base as ConfigBase, e.key, e.options);
			//if there is a value and, if options are specified, the options exist
			if (v != undefined && (!e.options || o != undefined)) {
				configProps.push({...e, base, value: v, options: o});
			}
		}
	}


const configItem = <Key, >(base: ConfigBase, key: Key, value_type: ConfigValueType, description: string, value: ConfigValue, options?: ConfigOptions, min?: number, max?: number) : React.JSX.Element => {
	switch (value_type) {
	case ConfigValueType.Boolean:
		return <ConfigItem
			key={ key as string }
			name={ key as string }
			base= { base}
			onChange={ onChangeConfig }
			title= { description }
			type={ ConfigType.OnOff }
			value={ value as boolean }
		/>;
	case ConfigValueType.String:
		return <ConfigItem
			key={ key as string }
			name={ key as string }
			base={ base }
			options={ options }
			onChange={ onChangeConfig }
			title= { description }
			type={ ConfigType.Combobox }
			value={ value as string }
		/>;
	case ConfigValueType.Float:
		if (options) {
			return <ConfigItem
				key={ key as string }
				name={ key as string }
				base={ base }
				options={ options }
				onChange={ onChangeConfig }
				title= { description }
				type={ ConfigType.Combobox }
				value={ value as string }
			/>;
		} else {
			return <ConfigItem
				key={ key as string }
				name={ key as string }
				base={ base }
				min={ min }
				max={ max }
				onChange={ onChangeConfig }
				title= { description }
				type={ ConfigType.Numeric }
				value={ value as number }
			/>;
		}
	case ConfigValueType.Int:
		return <ConfigItem
			key={ key as string }
			name={ key as string }
			base={ base }
			options={ options }
			onChange={ onChangeIntConfig }
			title= { description }
			type={ ConfigType.Combobox }
			value={ value as string }
		/>;

	default:
	throw new Error("unhandled");
	}
}

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
			{
				configProps.map(({base, key, value_type, value, description, options, min, max}) => {
					return configItem(base as ConfigBase, key, value_type, description, value, options, min, max);
				})
			}
		</Stack>
	);
});

export default SettingsList;
