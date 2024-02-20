import { Group, SegmentedControl, Switch, NumberInput, Select, Button, ActionIcon } from "@mantine/core";
import { ChangeEvent, FunctionComponent, ReactNode, memo } from "react";
import classes from "./settings.module.css";
import { SettingTarget } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export enum SettingsItemType {
	OnOff,
	Select,
	Switch,
	Numeric
}

export type SettingsItemValue = string | number | boolean;
export type SettingsItemOption = string | { label: string; value: string };

export interface BaseSettingsItemProps {
	description?: string;
	max?: number;
	min?: number;
	name: string;
	onChange: (target: SettingTarget, name: string, value: SettingsItemValue) => any;
	options?: Array<SettingsItemOption>;
	target: SettingTarget;
	title: string;
	type: SettingsItemType;
	value: SettingsItemValue
}

export interface SettingsNumericProps extends BaseSettingsItemProps {
	type: SettingsItemType.Numeric;
	value: number;
}

export interface SettingsOnOffProps extends BaseSettingsItemProps {
	type: SettingsItemType.OnOff,
	value: boolean;
}

export interface SettingsSelectProps extends BaseSettingsItemProps {
	type: SettingsItemType.Select;
	options: Array<SettingsItemOption>;
	value: string;
}

export interface SettingsToggleProps extends BaseSettingsItemProps {
	options: Array<SettingsItemOption>;
	type: SettingsItemType.Switch,
	value: string;
}

export type SettingsItemProps = SettingsNumericProps | SettingsOnOffProps | SettingsSelectProps | SettingsToggleProps;

const SettingsNumericInput = ({ onChange, min, max, name, target, value }: Pick<SettingsNumericProps, "max" | "min" | "name" | "onChange" | "target" | "value">) => {
	return (
		<NumberInput
			min ={ min }
			max={ max }
			onChange={ (v: number) => onChange(target, name, v) }
			name={ name }
			value={ value }
		/>
	);
};

const SettingOnOffInput = ({ onChange, name, target, value }: Pick<SettingsOnOffProps, "name" | "onChange" | "target" | "value">) => {
	return (
		<Switch
			checked={ value }
			name={ name }
			onChange={ (ev: ChangeEvent<HTMLInputElement>) => onChange(target, name, ev.currentTarget.checked) }
			size="md"
		/>
	);
};

const SettingsSelectInput = ({ onChange, name, options, target, value }: Pick<SettingsSelectProps, "name" | "onChange" | "options" | "target" | "value">) => {
	return (
		<Select
			data={ options }
			name={ name }
			onChange={ (v) => onChange(target, name, v) }
			value={ typeof value !== "string" ? `${value}` : value }
		/>
	);
};

const SettingsToggleInput = ({ onChange, name, options, target, value }: Pick<SettingsToggleProps, "name" | "onChange" | "options" | "target" | "value">) => {
	return (
		<SegmentedControl
			color="blue"
			data={ options }
			onChange={ (v: string) => onChange(target, name, v) }
			name={ name }
			value={ value }
			size="xs"
		/>
	);
};

export const SettingsItem: FunctionComponent<BaseSettingsItemProps> = memo(function SettingItemWrapper(props: BaseSettingsItemProps) {

	let el: ReactNode;
	const commonProps = { name: props.name, onChange: props.onChange, target: props.target };
	switch (props.type) {
		case SettingsItemType.Numeric: {
			const compProps = props as SettingsNumericProps;
			el = <SettingsNumericInput { ...commonProps } max={ compProps.max } min={ compProps.min } value={ compProps.value } />;
			break;
		}
		case SettingsItemType.OnOff: {
			const compProps = props as SettingsOnOffProps;
			el = <SettingOnOffInput { ...commonProps } value={ compProps.value } />;
			break;
		}
		case SettingsItemType.Select: {
			const compProps = props as SettingsSelectProps;
			el = <SettingsSelectInput { ...commonProps } options={ compProps.options } value = { compProps.value } />;
			break;
		}
		case SettingsItemType.Switch: {
			const compProps = props as SettingsSelectProps;
			el = <SettingsToggleInput { ...commonProps } options={ compProps.options } value={ compProps.value } />;
			break;
		}
		default:
			throw new Error(`Unknown SettingsType ${props.type}`);
	}

	return (
		<Group className={ classes.item } >
			<div className={ classes.itemTitleWrap } >
				<label htmlFor={ props.name } className={ classes.itemTitle } >{ props.title }</label>
				{
					props.description?.length ? <div className={ classes.itemDescription } >{ props.description }</div> : null
				}
			</div>
			<div className={ classes.itemInputWrap }>
				{ el }
			</div>
		</Group>
	);
});

export type SettingActionProps = {
	action: () => any;
	description?: string;
	icon: IconDefinition;
	label: string;
}

export const SettingsAction: FunctionComponent<SettingActionProps> = memo(function SettingActionWrapper(props: SettingActionProps) {

	const dispatch = useAppDispatch();

	return (
		<Group className={ classes.item } >
		<div className={ classes.itemTitleWrap } >
			<label className={ classes.itemTitle } >{ props.label }</label>
			{
				props.description?.length ? <div className={ classes.itemDescription } >{ props.description }</div> : null
			}
		</div>
		<div className={ classes.itemInputWrap } >
			<ActionIcon
				variant="outline"
				onClick={ () => dispatch(props.action()) }
			>
				<FontAwesomeIcon icon={ props.icon } />
			</ActionIcon>
		</div>
	</Group>
	)
});
