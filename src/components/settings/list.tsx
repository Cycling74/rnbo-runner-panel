import { Stack } from "@mantine/core";
import { BaseSettingsItemProps, SettingsItem } from "./item";
import { FunctionComponent, memo } from "react";

export type SettingsListProps = {
	items: Array<BaseSettingsItemProps>;
};

const SettingsList: FunctionComponent<SettingsListProps> = memo(function SettingsListWrapper({ items }: SettingsListProps) {

	return (
		<Stack gap="sm">
			{
				items.map(item => <SettingsItem key={ item.name } { ...item } />)
			}
		</Stack>
	);
});

export default SettingsList;
