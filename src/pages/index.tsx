import { Group, Stack, Title } from "@mantine/core";
import { FunctionComponent, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchersSortedByName } from "../selectors/patchers";
import { getConnections, getEditorNodesAndPorts, getPorts } from "../selectors/graph";
import GraphEditor from "../components/editor";
import PresetDrawer from "../components/presets";
import { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowInstance } from "reactflow";
import { loadPatcherNodeOnRemote } from "../actions/graph";
import {
	applyEditorEdgeChanges, applyEditorNodeChanges, createEditorConnection,
	editorZoomIn,
	editorZoomOut,
	generateEditorLayout,
	removeEditorConnectionsById, removeEditorNodesById,
	toggleEditorLockedState,
	triggerEditorFitView
} from "../actions/editor";
import SetsDrawer from "../components/sets";
import { destroySetPresetOnRemote, loadSetPresetOnRemote, renameSetPresetOnRemote, loadNewEmptyGraphSetOnRemote, destroyGraphSetOnRemote, loadGraphSetOnRemote, renameGraphSetOnRemote, saveGraphSetOnRemote, overwriteGraphSetOnRemote, overwriteSetPresetOnRemote, createSetPresetOnRemote } from "../actions/sets";
import { PresetRecord } from "../models/preset";
import { getCurrentGraphSet, getCurrentGraphSetIsDirty, getGraphSetPresetsSortedByName, getGraphSetsSortedByName } from "../selectors/sets";
import { useDisclosure } from "@mantine/hooks";
import { PatcherExportRecord } from "../models/patcher";
import { SortOrder } from "../lib/constants";
import { GraphSetRecord } from "../models/set";
import { mdiCamera, mdiContentSave, mdiGroup } from "@mdi/js";
import { ResponsiveButton } from "../components/elements/responsiveButton";
import { initEditor, unmountEditor } from "../actions/editor";
import { getGraphEditorLockedState } from "../selectors/editor";
import { AddNodeMenu } from "../components/editor/addNodeMenu";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		nodeInfo,
		connections,
		ports,
		graphSets,
		currentGraphSet,
		currentGraphSetIsDirty,
		graphPresets,
		editorLocked
	] = useAppSelector((state: RootStateType) => [
		getPatchersSortedByName(state, SortOrder.Asc),
		getEditorNodesAndPorts(state),
		getConnections(state),
		getPorts(state),
		getGraphSetsSortedByName(state, SortOrder.Asc),
		getCurrentGraphSet(state),
		getCurrentGraphSetIsDirty(state),
		getGraphSetPresetsSortedByName(state, SortOrder.Asc),
		getGraphEditorLockedState(state)
	]);

	const [setDrawerIsOpen,  { close: closeSetDrawer, toggle: toggleSetDrawer }] = useDisclosure();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();

	// Instances
	const onAddPatcherInstance = useCallback((patcher: PatcherExportRecord) => {
		dispatch(loadPatcherNodeOnRemote(patcher));
	}, [dispatch]);

	// Editor
	const onEditorInit = useCallback((instance: ReactFlowInstance) => {
		dispatch(initEditor(instance));
	}, [dispatch]);

	const onEditorFitView = useCallback(() => {
		dispatch(triggerEditorFitView());
	}, [dispatch]);

	const onEditorToggleLocked = useCallback(() => {
		dispatch(toggleEditorLockedState());
	}, [dispatch]);

	const onEditorAutoLayout = useCallback(() => {
		dispatch(generateEditorLayout());
	}, [dispatch]);

	const onEditorZoomIn = useCallback(() => {
		dispatch(editorZoomIn());
	}, [dispatch]);

	const onEditorZoomOut = useCallback(() => {
		dispatch(editorZoomOut());
	}, [dispatch]);

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
	const onLoadEmptySet = useCallback(() => {
		dispatch(loadNewEmptyGraphSetOnRemote());
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

	const onCreateSet = useCallback((name: string) => {
		dispatch(saveGraphSetOnRemote(name));
	}, [dispatch]);

	const onSaveCurrentSet = useCallback(() => {
		if (!currentGraphSet) return;
		dispatch(saveGraphSetOnRemote(currentGraphSet.name, false));
	}, [dispatch, currentGraphSet]);

	const onOverwriteSet = useCallback((set: GraphSetRecord) => {
		dispatch(overwriteGraphSetOnRemote(set));
	}, [dispatch]);

	// Presets
	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadSetPresetOnRemote(preset));
	}, [dispatch]);

	const onCreatePreset = useCallback(() => {
		dispatch(createSetPresetOnRemote());
	}, [dispatch]);

	const onOverwritePreset = useCallback((preset: PresetRecord) => {
		dispatch(overwriteSetPresetOnRemote(preset));
	}, [dispatch]);

	const onDeletePreset = useCallback((preset: PresetRecord) => {
		dispatch(destroySetPresetOnRemote(preset));
	}, [dispatch]);

	const onRenamePreset = useCallback((preset: PresetRecord, name: string) => {
		dispatch(renameSetPresetOnRemote(preset, name));
	}, [dispatch]);

	useEffect(() => {
		return () => dispatch(unmountEditor());
	}, [dispatch]);

	return (
		<>
			<Stack style={{ height: "100%" }} >
				<Group justify="space-between" wrap="nowrap">
					<Group>
						<Title size="md" my={ 0 } >
							{
								currentGraphSet
									? `${currentGraphSet.name}${currentGraphSetIsDirty ? "*" : ""}`
									: "Untitled*"
							}
						</Title>
					</Group>
					<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
						<AddNodeMenu
							onAddPatcherInstance={ onAddPatcherInstance }
							patchers={ patchers }
						/>
						<ResponsiveButton
							label="Save"
							tooltip="Save Graph"
							icon={ mdiContentSave }
							disabled={ !currentGraphSetIsDirty }
							onClick={ onSaveCurrentSet }
						/>
						<ResponsiveButton
							label="Graphs"
							tooltip="Open Graphs Menu"
							icon={ mdiGroup }
							onClick={ toggleSetDrawer }
						/>
						<ResponsiveButton
							label="Presets"
							tooltip="Open Graph Presets Menu"
							icon={ mdiCamera }
							onClick={ togglePresetDrawer }
						/>
					</Group>
				</Group>

				<GraphEditor
					nodeInfo={ nodeInfo }
					connections={ connections }
					ports={ ports }

					onConnect={ onConnectNodes }
					onNodesChange={ onNodesChange }
					onNodesDelete={ onNodesDelete }
					onEdgesChange={ onEdgesChange }
					onEdgesDelete={ onEdgesDelete }

					onInit={ onEditorInit }
					onAutoLayout={ onEditorAutoLayout }
					onFitView={ onEditorFitView }
					onToggleLocked={ onEditorToggleLocked }
					locked={ editorLocked }
					zoom={ 1 }
					onZoomIn={ onEditorZoomIn }
					onZoomOut={ onEditorZoomOut }
				/>
			</Stack>
			<SetsDrawer
				onClose={ closeSetDrawer }
				onDeleteSet={ onDeleteSet }
				onLoadSet={ onLoadSet }
				onLoadEmptySet={ onLoadEmptySet }
				onRenameSet={ onRenameSet }
				onCreateSet={ onCreateSet }
				onOverwriteSet={ onOverwriteSet }
				open={ setDrawerIsOpen }
				sets={ graphSets }
				currentSetId={ currentGraphSet?.name }
			/>
			<PresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onCreatePreset={ onCreatePreset }
				onRenamePreset={ onRenamePreset }
				onOverwritePreset={ onOverwritePreset }
				presets={ graphPresets }
			/>
		</>
	);
};

export default Index;
