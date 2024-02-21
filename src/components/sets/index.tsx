import { Divider, Drawer, Stack, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getGraphSetsSortedByName, getShowGraphSetsDrawer } from "../../selectors/sets";
import { destroyGraphSetOnRemote, hideGraphSets, loadGraphSetOnRemote, renameGraphSetOnRemote, saveGraphSetOnRemote } from "../../actions/sets";
import { GraphSetItem } from "./item";
import { SaveGraphSetForm } from "./save";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { DrawerSectionTitle } from "../page/drawer";
import { GraphSetRecord } from "../../models/set";
import { modals } from "@mantine/modals";

const SetsDrawer: FunctionComponent = memo(function WrappedSetsDrawer() {

	const dispatch = useAppDispatch();
	const [
		open,
		sets
	] = useAppSelector(state => [
		getShowGraphSetsDrawer(state),
		getGraphSetsSortedByName(state)
	]);

	const onCloseDrawer = useCallback(() => dispatch(hideGraphSets()), [dispatch]);
	const onSaveSet = useCallback((name: string) => {
		dispatch(saveGraphSetOnRemote(name));
	}, [dispatch]);

	const onRenameSet = useCallback((set: GraphSetRecord, name: string) => {
		dispatch(renameGraphSetOnRemote(set, name));
	}, [dispatch]);

	const onLoadSet = useCallback((set: GraphSetRecord) => {
		dispatch(loadGraphSetOnRemote(set));
		dispatch(hideGraphSets());
	}, [dispatch]);

	const onDeleteSet = useCallback((set: GraphSetRecord) => {
		modals.openConfirmModal({
			title: "Delete Set",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the set named { `"${set.name}"` }?
				</Text>
			),
			labels: { confirm: `Delete set ${name}`, cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(destroyGraphSetOnRemote(set))
		});
	}, [dispatch]);

	return (
		<Drawer
			opened={ open }
			onClose={ onCloseDrawer }
			position="right"
			title={ <span><FontAwesomeIcon icon={ faObjectGroup }/> Graph Sets</span> }
		>
			<SaveGraphSetForm onSave={ onSaveSet } />
			<Divider mt="lg" />
			<DrawerSectionTitle>Saved Sets</DrawerSectionTitle>
			<Stack gap="sm">
				{
					sets.map(set => <GraphSetItem key={ set.id } set={ set } onRename={ onRenameSet } onLoad={ onLoadSet } onDelete={ onDeleteSet }/> )
				}
			</Stack>
		</Drawer>
	);
});

export default SetsDrawer;
