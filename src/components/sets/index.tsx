import { ActionIcon, Button, Divider, Drawer, Flex, Group, Menu, Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { GraphSetItem } from "./item";
import { GraphSetRecord } from "../../models/set";
import classes from "./sets.module.css";
import { Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiContentSaveMove, mdiDotsVertical, mdiGroup, mdiPlus } from "@mdi/js";

export type SetsDrawerProps = {
	onClose: () => any;
	onDeleteSet: (set: GraphSetRecord) => any;
	onLoadSet: (set: GraphSetRecord) => any;
	onLoadEmptySet: () => any;
	onOverwriteSet: (set: GraphSetRecord) => any;
	onRenameSet: (set: GraphSetRecord, name: string) => any;
	onSaveSetAs: () => any;
	open: boolean;
	sets: Seq.Indexed<GraphSetRecord>;
	currentSetId: GraphSetRecord["id"];
}

const SetsDrawer: FunctionComponent<SetsDrawerProps> = memo(function WrappedSetsDrawer({
	onClose,
	open,
	sets,
	currentSetId,

	onDeleteSet,
	onLoadSet,
	onLoadEmptySet,
	onOverwriteSet,
	onRenameSet,
	onSaveSetAs

}) {

	const onTriggerDeleteSet = useCallback((set: GraphSetRecord) => {
		onDeleteSet(set);
	}, [onDeleteSet]);

	const validateUniqueSetName = useCallback((name: string): boolean => {
		return !sets.find(s => s.name === name);
	}, [sets]);

	return (
		<Drawer.Root opened={ open } onClose={ onClose } position="right">
			<Drawer.Overlay />
			<Drawer.Content>
				<Flex direction="column" style={{ height: "100%" }}>
					<Drawer.Header>
						<Drawer.Title>
							<Group gap="xs">
								<IconElement path={ mdiGroup } />
								Graphs
							</Group>
						</Drawer.Title>
						<Drawer.CloseButton />
					</Drawer.Header>
					<Drawer.Body style={{ flex: 1 }} >
						<Flex direction="column" style={{ height: "100%" }} gap="lg" >
							<Flex className={ classes.setListWrapper } direction="column">
								<Stack gap="sm" >
									{
										sets.map(set => (
											<GraphSetItem
												key={ set.id }
												set={ set }
												isCurrent={ set.id === currentSetId }
												onRename={ onRenameSet }
												onLoad={ onLoadSet }
												onDelete={ onTriggerDeleteSet }
												onOverwrite={ onOverwriteSet }
												validateUniqueName={ validateUniqueSetName }
											/>
										))
									}
								</Stack>
							</Flex>
							<Divider />
							<Group>
								<Button
									variant="outline"
									fullWidth={true}
									leftSection={ <IconElement path={ mdiPlus } /> } onClick={ onLoadEmptySet }
									className={ classes.newSetButton }
								>
									Create New Graph
								</Button>
								<Menu position="top-end" >
									<Menu.Target>
										<ActionIcon variant="subtle" color="gray">
											<IconElement path={ mdiDotsVertical } />
										</ActionIcon>
									</Menu.Target>
									<Menu.Dropdown>
										<Menu.Item leftSection={ <IconElement path={ mdiContentSaveMove } /> } onClick={ onSaveSetAs } >Save As</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							</Group>
						</Flex>
					</Drawer.Body>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
});

export default SetsDrawer;
