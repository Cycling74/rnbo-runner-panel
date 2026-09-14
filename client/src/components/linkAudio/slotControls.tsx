import { FC } from "react";
import { ActionIcon, Group, Menu } from "@mantine/core";
import { mdiArrowDown, mdiArrowUp, mdiDotsVertical, mdiPencil, mdiTrashCan } from "@mdi/js";
import { IconElement } from "../elements/icon";

export type CommonSlotControlsProps = {
	first: boolean;
	last: boolean;
	// omitted when the slot list is too short to reorder
	onUp?: () => void;
	onDown?: () => void;
	onTriggerRemove: () => void;
};

export const ReceiveSlotControls: FC<CommonSlotControlsProps> = ({ first, last, onUp, onDown, onTriggerRemove }) => (
	<Group gap="xs" wrap="nowrap" >
		{
			onUp && onDown ? (
				<>
					<ActionIcon variant="default" disabled={ first } onClick={ onUp } aria-label="Move up" >
						<IconElement path={ mdiArrowUp } />
					</ActionIcon>
					<ActionIcon variant="default" disabled={ last } onClick={ onDown } aria-label="Move down" >
						<IconElement path={ mdiArrowDown } />
					</ActionIcon>
				</>
			) : null
		}
		<Menu position="bottom-end" >
			<Menu.Target>
				<ActionIcon variant="subtle" color="gray" size="md">
					<IconElement path={ mdiDotsVertical } />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item color="red" leftSection={<IconElement path={mdiTrashCan} />} onClick={onTriggerRemove } >Delete</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	</Group>
);

export type SendSlotControlProps = CommonSlotControlsProps & {
	onTriggerRename: () => void;
};

export const SendSlotControls: FC<SendSlotControlProps> = ({ first, last, onUp, onDown, onTriggerRemove, onTriggerRename }) => (
	<Group gap="xs" wrap="nowrap" >
		{
			onUp && onDown ? (
				<>
					<ActionIcon variant="default" disabled={first} onClick={onUp} aria-label="Move up" >
						<IconElement path={mdiArrowUp} />
					</ActionIcon>
					<ActionIcon variant="default" disabled={last} onClick={onDown} aria-label="Move down" >
						<IconElement path={mdiArrowDown} />
					</ActionIcon>
				</>
			) : null
		}
		<Menu position="bottom-end" >
			<Menu.Target>
				<ActionIcon variant="subtle" color="gray" size="md">
					<IconElement path={mdiDotsVertical} />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item leftSection={<IconElement path={mdiPencil} />} onClick={onTriggerRename} >Rename</Menu.Item>
				<Menu.Divider />
				<Menu.Item color="red" leftSection={<IconElement path={mdiTrashCan} />} onClick={onTriggerRemove} >Delete</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	</Group>
);
