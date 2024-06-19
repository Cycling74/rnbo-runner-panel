import { Button, Group, Stack } from "@mantine/core";
import { FunctionComponent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchersSortedByName } from "../selectors/patchers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectGroup, faCamera, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
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
import { destroySetPresetOnRemote, loadSetPresetOnRemote, saveSetPresetToRemote, renameSetPresetOnRemote, clearGraphSetOnRemote, destroyGraphSetOnRemote, loadGraphSetOnRemote, renameGraphSetOnRemote, saveGraphSetOnRemote } from "../actions/sets";
import { destroyPatcherOnRemote, renamePatcherOnRemote } from "../actions/patchers";
import { PresetRecord } from "../models/preset";
import { getGraphSetPresetsSortedByName, getGraphSetsSortedByName } from "../selectors/sets";
import { useDisclosure } from "@mantine/hooks";
import PatcherDrawer from "../components/patchers";
import { PatcherRecord } from "../models/patcher";
import { SortOrder } from "../lib/constants";
import { GraphSetRecord } from "../models/set";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		nodes,
		connections,
		graphSets,
		graphPresets
	] = useAppSelector((state: RootStateType) => [
		getPatchersSortedByName(state, SortOrder.Asc),
		getNodes(state),
		getConnections(state),
		getGraphSetsSortedByName(state, SortOrder.Asc),
		getGraphSetPresetsSortedByName(state, SortOrder.Asc)
	]);

	const [patcherDrawerIsOpen, { close: closePatcherDrawer, toggle: togglePatcherDrawer }] = useDisclosure();
	const [setDrawerIsOpen,  { close: closeSetDrawer, toggle: toggleSetDrawer }] = useDisclosure();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();

	// Instances
	const onAddInstance = useCallback((patcher: PatcherRecord) => {
		dispatch(loadPatcherNodeOnRemote(patcher));
		closePatcherDrawer();
	}, [dispatch, closePatcherDrawer]);

	// Nodes
	const onConnectNodes = useCallback((connection: Connection) => {
		dispatch(createEditorConnection(connection));
	}, [dispatch]);

	const onNodesChange = useCallback((changes: NodeChange[]) => {
		dispatch(applyEditorNodeChanges(changes));
	}, [dispatch]);

	const onNodesDelete = useCallback((nodes: Pick<Node, "id">[]) => {
		dispatch(removeEditorNodesById(nodes.map(n => n.id)));
	}, [dispatch]);

	// Edges
	const onEdgesChange = useCallback((changes: EdgeChange[]) => {
		dispatch(applyEditorEdgeChanges(changes));
	}, [dispatch]);

	const onEdgesDelete = useCallback((edges: Pick<Edge, "id">[]) => {
		dispatch(removeEditorConnectionsById(edges.map(e => e.id)));
	}, [dispatch]);

	// Sets
	const onClearSet = useCallback(() => {
		dispatch(clearGraphSetOnRemote());
		closeSetDrawer();
	}, [dispatch, closeSetDrawer]);

	const onDeleteSet = useCallback((set: GraphSetRecord) => {
		dispatch(destroyGraphSetOnRemote(set));
	}, [dispatch]);

	const onLoadSet = useCallback((set: GraphSetRecord) => {
		dispatch(loadGraphSetOnRemote(set));
		closeSetDrawer();
	}, [dispatch, closeSetDrawer]);

	const onRenameSet = useCallback((set: GraphSetRecord, name: string) => {
		dispatch(renameGraphSetOnRemote(set, name));
	}, [dispatch]);

	const onSaveSet = useCallback((name: string) => {
		dispatch(saveGraphSetOnRemote(name));
	}, [dispatch]);

	// Presets
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

	const onDeletePatcher = useCallback((p: PatcherRecord) => {
		dispatch(destroyPatcherOnRemote(p));
	}, [dispatch]);

	const onRenamePatcher = useCallback((p: PatcherRecord, name: string) => {
		dispatch(renamePatcherOnRemote(p, name));
	}, [dispatch]);

	return (
		<>
			<Stack style={{ height: "100%" }} >
				<Group justify="space-between" wrap="nowrap">
					<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faVectorSquare } /> } onClick={ togglePatcherDrawer } >
						Patchers
					</Button>
					<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
						<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faObjectGroup } /> } onClick={ toggleSetDrawer } >
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
			<PatcherDrawer
				open={ patcherDrawerIsOpen }
				patchers={ patchers }
				onClose={ closePatcherDrawer }
				onLoadPatcher={ onAddInstance }
				onRenamePatcher={ onRenamePatcher }
				onDeletePatcher={ onDeletePatcher }
			/>
			<SetsDrawer
				onClose={ closeSetDrawer }
				onClearSet={ onClearSet }
				onDeleteSet={ onDeleteSet }
				onLoadSet={ onLoadSet }
				onRenameSet={ onRenameSet }
				onSaveSet={ onSaveSet }
				open={ setDrawerIsOpen }
				sets={ graphSets }
			/>
			<PresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onSavePreset={ onSavePreset }
				onRenamePreset={ onRenamePreset }
				presets={ graphPresets }
			/>
		</>
	);
};

export default Index;
