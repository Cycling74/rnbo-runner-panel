import { Stack } from "@mantine/core";
import { BaseSettingsItemProps, SettingActionProps, SettingsAction, SettingsItem } from "./item";
import { FunctionComponent, memo } from "react";

export type SettingsListProps = {
	actions?: Array<SettingActionProps>;
	items: Array<BaseSettingsItemProps>;
};

const SettingsList: FunctionComponent<SettingsListProps> = memo(function SettingsListWrapper({ actions, items }: SettingsListProps) {

	return (
		<Stack gap="xs">
			{
				items.map(item => <SettingsItem key={ item.name } { ...item } />)
			}
			{
				actions?.map(action => <SettingsAction key={ action.label } { ...action } /> )
			}
		</Stack>
	);
});

export default SettingsList;
