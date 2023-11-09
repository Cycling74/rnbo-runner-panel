import { Group, SegmentedControl, Switch } from "@mantine/core";
import { ChangeEvent, FunctionComponent, ReactNode, memo } from "react";
import classes from "./settings.module.css";
import { Setting, SettingsValue } from "../../reducers/settings";
import { ConfigValueType } from "../../actions/config";
import { ConfigBase } from "../../models/config";

export enum SettingsType {
	OnOff,
	Switch
}

export type SettingsOption = string | { label: string; value: string };

export interface BaseSettingsItemProps {
	description?: string;
	name: Setting;
	onChange: (name: Setting, value: SettingsValue) => any;
	options?: Array<SettingsOption>;
	title: string;
	type: SettingsType;
	value: SettingsValue;
}

export interface SettingsOnOffProps extends BaseSettingsItemProps {
	type: SettingsType.OnOff,
	value: boolean;
}

export interface SettingsToggleProps extends BaseSettingsItemProps {
	options: Array<SettingsOption>;
	type: SettingsType.Switch,
	value: string;
}

export type SettingsItemProps = SettingsOnOffProps | SettingsToggleProps;

const SettingOnOffInput = ({ onChange, name, value }: Pick<SettingsOnOffProps, "name" | "onChange" | "value">) => (
	<Switch name={ name } checked={ value } onChange={ (ev: ChangeEvent<HTMLInputElement>) => onChange(name, ev.currentTarget.checked) } />
);

const SettingToggleInput = ({ onChange, name, options, value }: Pick<SettingsToggleProps, "name" | "onChange" | "options" | "value">) => (
	<SegmentedControl size="xs" color="blue" name={ name } value={ value } data={ options } onChange={ (v: string) => onChange(name, v) }/>
);

export const SettingsItem: FunctionComponent<SettingsItemProps> = memo(function SettingItemWrapper({
	description,
	name,
	onChange,
	options,
	title,
	type,
	value
}: SettingsItemProps) {

	let el: ReactNode;
	const commonProps = { name, onChange };
	switch (type) {
		case SettingsType.OnOff:
			el = <SettingOnOffInput { ...commonProps } value={ value } />;
			break;
		case SettingsType.Switch:
			el = <SettingToggleInput { ...commonProps } options={ options } value={ value } />;
			break;
		default:
			throw new Error(`Unknown SettingsType ${type}`);
	}

	return (
		<Group className={ classes.item } >
			<div className={ classes.itemInputWrap }>
				{ el }
			</div>
			<div className={ classes.itemTitleWrap } >
				<label htmlFor={ name } className={ classes.itemTitle } >{ title }</label>
				{
					description?.length ? <div className={ classes.itemDescription } >{ description }</div> : null
				}
			</div>
		</Group>
	);
});

export enum ConfigType {
	OnOff,
	Switch
}

export type ConfigOption = string | { label: string; value: string };

export interface BaseConfigItemProps {
	description?: string;
	base: ConfigBase;
	name: string;
	onChange: (base: ConfigBase, key: string, value: ConfigValueType) => any;
	options?: Array<ConfigOption>;
	title: string;
	type: ConfigType;
	value: ConfigValueType;
}

export interface ConfigOnOffProps extends BaseConfigItemProps {
	type: ConfigType.OnOff,
	value: boolean;
}

export interface ConfigToggleProps extends BaseConfigItemProps {
	options: Array<ConfigOption>;
	type: ConfigType.Switch,
	value: string;
}

export type ConfigItemProps = ConfigOnOffProps | ConfigToggleProps;

const ConfigOnOffInput = ({ onChange, base, name, value }: Pick<ConfigOnOffProps, "base" | "name" | "onChange" | "value">) => (
	<Switch name={ name } checked={ value } onChange={ (ev: ChangeEvent<HTMLInputElement>) => onChange(base, name, ev.currentTarget.checked) } />
);

const ConfigToggleInput = ({ onChange, base, name, options, value }: Pick<ConfigToggleProps, "base" | "name" | "onChange" | "options" | "value">) => (
	<SegmentedControl size="xs" color="blue" name={ name } value={ value } data={ options } onChange={ (v: string) => onChange(base, name, v) }/>
);

export const ConfigItem: FunctionComponent<ConfigItemProps> = memo(function ConfigItemWrapper({
	description,
	base,
	name,
	onChange,
	options,
	title,
	type,
	value
}: ConfigItemProps) {

	let el: ReactNode;
	const commonProps = { base, name, onChange };
	switch (type) {
		case ConfigType.OnOff:
			el = <ConfigOnOffInput { ...commonProps } value={ value } />;
			break;
		case ConfigType.Switch:
			el = <ConfigToggleInput { ...commonProps } options={ options } value={ value } />;
			break;
		default:
			throw new Error(`Unknown ConfigType ${type}`);
	}

	return (
		<Group className={ classes.item } >
			<div className={ classes.itemInputWrap }>
				{ el }
			</div>
			<div className={ classes.itemTitleWrap } >
				<label htmlFor={ name } className={ classes.itemTitle } >{ title }</label>
				{
					description?.length ? <div className={ classes.itemDescription } >{ description }</div> : null
				}
			</div>
		</Group>
	);
});
