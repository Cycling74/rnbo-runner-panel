import { Button, Divider, Drawer, Flex, Group, Stack, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { GraphSetItem } from "./item";
import { SaveGraphSetForm } from "./save";
import { DrawerSectionTitle } from "../page/drawer";
import { GraphSetRecord } from "../../models/set";
import { modals } from "@mantine/modals";
import classes from "./sets.module.css";
import { Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiEraser, mdiGroup } from "@mdi/js";

export type SetsDrawerProps = {
	onClose: () => any;
	onCreateSet: (name: string) => any;
	onDeleteSet: (set: GraphSetRecord) => any;
	onLoadSet: (set: GraphSetRecord) => any;
	onLoadEmptySet: () => any;
	onRenameSet: (set: GraphSetRecord, name: string) => any;
	onOverwriteSet: (set: GraphSetRecord) => any;
	open: boolean;
	sets: Seq.Indexed<GraphSetRecord>;
	currentSetId: GraphSetRecord["id"];
}

const SetsDrawer: FunctionComponent<SetsDrawerProps> = memo(function WrappedSetsDrawer({
	onClose,
	open,
	sets,
	currentSetId,

	onCreateSet,
	onDeleteSet,
	onLoadSet,
	onLoadEmptySet,
	onRenameSet,
	onOverwriteSet

}) {

	const onTriggerDeleteSet = useCallback((set: GraphSetRecord) => {
		modals.openConfirmModal({
			title: "Delete Graph",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the graph named { `"${set.name}"` }?
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onDeleteSet(set)
		});
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
							<SaveGraphSetForm onSave={ onCreateSet } />
							<Divider />
							<Flex className={ classes.setListWrapper } direction="column">
								<DrawerSectionTitle>Saved Graphs</DrawerSectionTitle>
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
							<Button variant="outline" fullWidth={true} leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onLoadEmptySet } >
								Create New Graph
							</Button>
						</Flex>
					</Drawer.Body>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
});

export default SetsDrawer;
