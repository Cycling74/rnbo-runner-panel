import { Group, SegmentedControl, Switch } from "@mantine/core";
import { ChangeEvent, FunctionComponent, ReactNode, memo } from "react";
import classes from "./settings.module.css";
import { Setting, SettingsValue } from "../../reducers/settings";

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

const SettingsItem: FunctionComponent<SettingsItemProps> = memo(function SettingItemWrapper({
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

export default SettingsItem;
