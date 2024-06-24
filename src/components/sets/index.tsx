import { Button, Divider, Drawer, Flex, Group, Stack, Text } from "@mantine/core";
import { FunctionComponent, MouseEvent, memo, useCallback } from "react";
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
	onClearSet: () => any;
	onDeleteSet: (set: GraphSetRecord) => any;
	onLoadSet: (set: GraphSetRecord) => any;
	onRenameSet: (set: GraphSetRecord, name: string) => any;
	onSaveSet: (name: string) => any;
	onSaveSetAs: (set: GraphSetRecord) => any;
	open: boolean;
	sets: Seq.Indexed<GraphSetRecord>;
}

const SetsDrawer: FunctionComponent<SetsDrawerProps> = memo(function WrappedSetsDrawer({
	onClose,
	open,
	sets,

	onClearSet,
	onDeleteSet,
	onLoadSet,
	onRenameSet,
	onSaveSet,
	onSaveSetAs

}) {

	const onTriggerDeleteSet = useCallback((set: GraphSetRecord) => {
		modals.openConfirmModal({
			title: "Delete Set",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the set named { `"${set.name}"` }?
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onDeleteSet(set)
		});
	}, [onDeleteSet]);

	const onTriggerClearSet = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		modals.openConfirmModal({
			title: "Clear Set",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to clear the working set? Any unsaved changes will be lost.
				</Text>
			),
			labels: { confirm: "Ok", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onClearSet()
		});
	}, [onClearSet]);

	return (
		<Drawer.Root opened={ open } onClose={ onClose } position="right">
			<Drawer.Overlay />
			<Drawer.Content>
				<Flex direction="column" style={{ height: "100%" }}>
					<Drawer.Header>
						<Drawer.Title>
							<Group gap="xs">
								<IconElement path={ mdiGroup } />
								Graph Sets
							</Group>
						</Drawer.Title>
						<Drawer.CloseButton />
					</Drawer.Header>
					<Drawer.Body style={{ flex: 1 }} >
						<Flex direction="column" style={{ height: "100%" }} gap="lg" >
							<SaveGraphSetForm onSave={ onSaveSet } />
							<Divider />
							<Flex className={ classes.setListWrapper } direction="column">
								<DrawerSectionTitle>Saved Sets</DrawerSectionTitle>
								<Stack gap="sm" >
									{
										sets.map(set => <GraphSetItem key={ set.id } set={ set } onRename={ onRenameSet } onLoad={ onLoadSet } onDelete={ onTriggerDeleteSet } onSave={ onSaveSetAs }/> )
									}
								</Stack>
							</Flex>
							<Divider />
							<Button variant="outline" fullWidth={true} leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onTriggerClearSet } color="red" >
								Clear Set
							</Button>
						</Flex>
					</Drawer.Body>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
});

export default SetsDrawer;
