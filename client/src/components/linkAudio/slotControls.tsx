import { FC } from "react";
import { ActionIcon, Group } from "@mantine/core";
import { mdiArrowDown, mdiArrowUp, mdiTrashCan } from "@mdi/js";
import { IconElement } from "../elements/icon";

export type SlotControlsProps = {
	first: boolean;
	last: boolean;
	// omitted when the slot list is too short to reorder
	onUp?: () => void;
	onDown?: () => void;
	onRemove: () => void;
};

// Up / down / delete controls shared by both slot row types. Reorder is buttons rather than
// drag-and-drop: no new dependency, and it works on the Move's touch screen.
export const SlotControls: FC<SlotControlsProps> = ({ first, last, onUp, onDown, onRemove }) => (
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
		<ActionIcon variant="default" color="red" onClick={ onRemove } aria-label="Remove" >
			<IconElement path={ mdiTrashCan } />
		</ActionIcon>
	</Group>
);
