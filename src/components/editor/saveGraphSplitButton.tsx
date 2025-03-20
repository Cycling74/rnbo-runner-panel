import { ActionIcon, Group, Menu } from "@mantine/core";
import { FC, memo } from "react";
import { ResponsiveButton } from "../elements/responsiveButton";
import { mdiChevronDown, mdiContentSave, mdiContentSaveMove, mdiPlus } from "@mdi/js";
import { IconElement } from "../elements/icon";
import styles from "./saveGraphSplitButton.module.css";

export type SaveGraphSplitButtonProps = {
	onLoadEmptySet: () => void;
	onSaveCurrentSet: () => void;
	onSaveCurrentSetAs: () => void;
};

export const SaveGraphSplitButton: FC<SaveGraphSplitButtonProps> = memo(function WrapedSaveGraphButtton({
	onLoadEmptySet,
	onSaveCurrentSet,
	onSaveCurrentSetAs
}) {
	return (
		<Group gap={ 0 } >
			<ResponsiveButton
				className={ styles.saveButton }
				label="Save"
				tooltip="Save Graph"
				variant="default"
				icon={ mdiContentSave }
				onClick={ onSaveCurrentSet }
			/>
			<Menu position="bottom-end" >
				<Menu.Target>
					<ActionIcon variant="default" size={ 36 } className={ styles.dropdownButton } >
						<IconElement path={ mdiChevronDown } />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item onClick={ onSaveCurrentSet } leftSection={ <IconElement path={ mdiContentSave } /> } >
						Save Graph
					</Menu.Item>
					<Menu.Item onClick={ onSaveCurrentSetAs } leftSection={ <IconElement path={ mdiContentSaveMove } /> } >
						Save Graph As...
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={ onLoadEmptySet } leftSection={ <IconElement path={ mdiPlus } /> } >
						Create New Graph
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
