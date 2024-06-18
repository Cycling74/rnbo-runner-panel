import { Button, Group, Stack } from "@mantine/core";
import { FunctionComponent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchersSortedByName } from "../selectors/patchers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectGroup, faPlus, faCamera } from "@fortawesome/free-solid-svg-icons";
import { getConnections, getNodes } from "../selectors/graph";
import GraphEditor from "../components/editor";
import PresetDrawer from "../components/presets";
import { Connection, Edge, EdgeChange, Node, NodeChange } from "reactflow";
import {
	applyEditorEdgeChanges, applyEditorNodeChanges, createEditorConnection,
	removeEditorConnectionsById, removeEditorNodesById,
	loadPatcherNodeOnRemote
} from "../actions/graph";
import SetsDrawer from "../components/sets";
import { destroySetPresetOnRemote, loadSetPresetOnRemote, saveSetPresetToRemote, renameSetPresetOnRemote, toggleShowGraphSets } from "../actions/sets";
import { PresetRecord } from "../models/preset";
import { getGraphSetPresetsSortedByName } from "../selectors/sets";
import { useDisclosure } from "@mantine/hooks";
import PatcherDrawer from "../components/patchers";
import { PatcherRecord } from "../models/patcher";
import { SortOrder } from "../lib/constants";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		nodes,
		connections,
		presets
	] = useAppSelector((state: RootStateType) => [
		getPatchersSortedByName(state, SortOrder.Asc),
		getNodes(state),
		getConnections(state),
		getGraphSetPresetsSortedByName(state, SortOrder.Asc)
	]);

	const [patcherDrawerIsOpen, { close: closePatcherDrawer, toggle: togglePatcherDrawer }] = useDisclosure();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();

	const onAddInstance = useCallback((patcher: PatcherRecord) => {
		dispatch(loadPatcherNodeOnRemote(patcher));
		closePatcherDrawer();
	}, [dispatch, closePatcherDrawer]);

	const onConnectNodes = useCallback((connection: Connection) => {
		dispatch(createEditorConnection(connection));
	}, [dispatch]);

	const onNodesChange = useCallback((changes: NodeChange[]) => {
		dispatch(applyEditorNodeChanges(changes));
	}, [dispatch]);

	const onNodesDelete = useCallback((nodes: Pick<Node, "id">[]) => {
		dispatch(removeEditorNodesById(nodes.map(n => n.id)));
	}, [dispatch]);

	const onEdgesChange = useCallback((changes: EdgeChange[]) => {
		dispatch(applyEditorEdgeChanges(changes));
	}, [dispatch]);

	const onEdgesDelete = useCallback((edges: Pick<Edge, "id">[]) => {
		dispatch(removeEditorConnectionsById(edges.map(e => e.id)));
	}, [dispatch]);

	const onToggleSetsDrawer = useCallback(() => {
		dispatch(toggleShowGraphSets());
	}, [dispatch]);

	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadSetPresetOnRemote(preset));
	}, [dispatch]);

	const onSavePreset = useCallback((name: string) => {
		dispatch(saveSetPresetToRemote(name));
	}, [dispatch]);

	const onDeletePreset = useCallback((preset: PresetRecord) => {
		dispatch(destroySetPresetOnRemote(preset));
	}, [dispatch]);

	const onRenamePreset = useCallback((preset: PresetRecord, name: string) => {
		dispatch(renameSetPresetOnRemote(preset, name));
	}, [dispatch]);

	return (
		<>
			<Stack style={{ height: "100%" }} >
				<Group justify="space-between" wrap="nowrap">
					<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faPlus } /> } onClick={ togglePatcherDrawer } >
						Add Patcher Instance
					</Button>
					<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
						<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faObjectGroup } /> } onClick={ onToggleSetsDrawer } >
							Sets
						</Button>
						<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faCamera } /> } onClick={ togglePresetDrawer } >
							Presets
						</Button>
					</Group>
				</Group>
				<GraphEditor
					nodes={ nodes }
					connections={ connections }
					onConnect={ onConnectNodes }
					onNodesChange={ onNodesChange }
					onNodesDelete={ onNodesDelete }
					onEdgesChange={ onEdgesChange }
					onEdgesDelete={ onEdgesDelete }
				/>
			</Stack>
			<PatcherDrawer open={ patcherDrawerIsOpen } onClose={ closePatcherDrawer } patchers={ patchers } onLoadPatcher={ onAddInstance } />
			<SetsDrawer />
			<PresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onSavePreset={ onSavePreset }
				onRenamePreset={ onRenamePreset }
				presets={ presets }
			/>
		</>
	);
};

export default Index;
