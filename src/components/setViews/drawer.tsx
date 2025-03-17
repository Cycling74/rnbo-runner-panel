import { Map as ImmuMap }from "immutable";
import { Button, Divider, Drawer, Flex, Group, Stack } from "@mantine/core";
import { FC, useCallback } from "react";
import { IconElement } from "../elements/icon";
import { mdiPlus, mdiTableEye } from "@mdi/js";
import { GraphSetViewRecord } from "../../models/set";
import { GraphSetViewItem } from "./item";
import styles from "./setviews.module.css";

export type CreateSetViewModalProps = {
	onClose: () => void;
	open: boolean;

	onCreateSetView: () => void;
	onDeleteSetView: (setView: GraphSetViewRecord) => void;
	onLoadSetView: (setView: GraphSetViewRecord) => void;
	onRenameSetView: (setView: GraphSetViewRecord, name: string) => void;

	currentSetView?: GraphSetViewRecord;
	setViews: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>;
};

const SetViewDrawer: FC<CreateSetViewModalProps> = ({
	onClose,
	open,
	onCreateSetView,
	onDeleteSetView,
	onLoadSetView,
	onRenameSetView,

	currentSetView,
	setViews
}) => {

	const onTriggerDeleteSetView = useCallback((setView: GraphSetViewRecord) => {
		onDeleteSetView(setView);
	}, [onDeleteSetView]);

	const validateUniqueSetViewName = useCallback((name: string): boolean => {
		return !setViews.find(v => v.name === name);
	}, [setViews]);

	return (
		<Drawer.Root opened={ open } onClose={ onClose } position="right">
			<Drawer.Overlay />
			<Drawer.Content>
				<Flex direction="column" style={{ height: "100%" }}>
					<Drawer.Header>
						<Drawer.Title>
							<Group gap="xs">
								<IconElement path={ mdiTableEye } />
								Parameter Views
							</Group>
						</Drawer.Title>
						<Drawer.CloseButton />
					</Drawer.Header>
					<Drawer.Body style={{ flex: 1 }} >
						<Flex direction="column" style={{ height: "100%" }} gap="lg" >
							<Flex className={ styles.viewListWrapper } direction="column">
								<Stack gap="sm" >
									{
										setViews.valueSeq().map(v => (
											<GraphSetViewItem
												key={ v.id }
												setView={ v }
												isActive={ v.id === currentSetView?.id }
												onDelete={ onTriggerDeleteSetView }
												onRename={ onRenameSetView }
												onLoad={ onLoadSetView }
												validateUniqueName={ validateUniqueSetViewName }
											/>
										))
									}
								</Stack>
							</Flex>
							<Divider />
							<Button variant="outline" leftSection={ <IconElement path={ mdiPlus } /> } fullWidth={ true } onClick={ onCreateSetView } >
								Create Parameter View
							</Button>
						</Flex>
					</Drawer.Body>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
};

export default SetViewDrawer;
