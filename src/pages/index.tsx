import { ActionIcon, Group, Stack, Tooltip } from "@mantine/core";
import { FunctionComponent, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchersSortedByName } from "../selectors/patchers";
import { getConnections, getEditorNodesAndPorts, getPorts } from "../selectors/graph";
import GraphEditor from "../components/editor";
import PresetDrawer from "../components/presets";
import { Connection, EdgeChange, NodeChange, ReactFlowInstance } from "reactflow";
import { loadPatcherNodeOnRemote } from "../actions/graph";
import {
	applyEditorEdgeChanges, applyEditorNodeChanges, changeNodeAlias, createEditorConnection,
	editorZoomIn,
	editorZoomOut,
	generateEditorLayout,
	toggleEditorLockedState,
	triggerEditorFitView
} from "../actions/editor";
import { destroySetPresetOnRemote, loadSetPresetOnRemote, renameSetPresetOnRemote, loadNewEmptyGraphSetOnRemote, overwriteSetPresetOnRemote, createSetPresetOnRemote, saveCurrentGraphSetOnRemote, saveCurrentGraphSetOnRemoteAs, reloadCurrentGraphSetOnRemote, destroyCurrentGraphSetOnRemote, renameCurrentGraphSetOnRemote, triggerLoadGraphSetDialog } from "../actions/sets";
import { PresetRecord } from "../models/preset";
import { getCurrentGraphSet, getCurrentGraphSetId, getCurrentGraphSetIsDirty, getGraphSetPresetsSortedByName } from "../selectors/sets";
import { useDisclosure } from "@mantine/hooks";
import { PatcherExportRecord } from "../models/patcher";
import { PatcherSortAttr, SortOrder, UnsavedSetName } from "../lib/constants";
import { mdiCamera, mdiContentSave } from "@mdi/js";
import { initEditor, unmountEditor } from "../actions/editor";
import { getGraphEditorLockedState } from "../selectors/editor";
import { AddNodeMenu } from "../components/editor/addNodeMenu";
import { GraphSetMenu } from "../components/editor/graphMenu";
import { GraphSetTitle } from "../components/editor/setTitle";
import { IconElement } from "../components/elements/icon";
import { GraphNodeRecord } from "../models/graph";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		nodeInfo,
		connections,
		ports,
		currentGraphSet,
		currentGraphSetId,
		currentGraphSetIsDirty,
		graphPresets,
		editorLocked
	] = useAppSelector((state: RootStateType) => [
		getPatchersSortedByName(state, SortOrder.Asc),
		getEditorNodesAndPorts(state),
		getConnections(state),
		getPorts(state),
		getCurrentGraphSet(state),
		getCurrentGraphSetId(state),
		getCurrentGraphSetIsDirty(state),
		getGraphSetPresetsSortedByName(state, SortOrder.Asc),
		getGraphEditorLockedState(state)
	]);

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

	const onRenameNode = useCallback((node: GraphNodeRecord) => {
		dispatch(changeNodeAlias(node));
	}, [dispatch]);

	// Edges
	const onEdgesChange = useCallback((changes: EdgeChange[]) => {
		dispatch(applyEditorEdgeChanges(changes));
	}, [dispatch]);

	// Current Set
	const onSaveCurrentSet = useCallback(() => {
		if (!currentGraphSetId) return;
		dispatch(saveCurrentGraphSetOnRemote());
	}, [dispatch, currentGraphSetId]);

	const onSaveCurrentSetAs = useCallback(() => {
		dispatch(saveCurrentGraphSetOnRemoteAs());
	}, [dispatch]);

	const onRenameCurrentSet = useCallback(() => {
		if (!currentGraphSetId) return;
		dispatch(renameCurrentGraphSetOnRemote());
	}, [dispatch, currentGraphSetId]);

	const onReloadCurrentSet = useCallback(() => {
		if (!currentGraphSetId) return;
		dispatch(reloadCurrentGraphSetOnRemote());
	}, [dispatch, currentGraphSetId]);

	const onDeleteCurrentSet = useCallback(() => {
		if (!currentGraphSetId) return;
		dispatch(destroyCurrentGraphSetOnRemote());
	}, [dispatch, currentGraphSetId]);

	// Sets
	const onLoadEmptySet = useCallback(() => {
		dispatch(loadNewEmptyGraphSetOnRemote());
	}, [dispatch]);

	const onTriggerLoadSet = useCallback(() => {
		dispatch(triggerLoadGraphSetDialog());
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
					<GraphSetTitle
						name={ currentGraphSet?.name || "Untitled" }
						isDirty={ !currentGraphSet || currentGraphSetIsDirty }
					/>
					<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
						<AddNodeMenu
							onAddPatcherInstance={ onAddPatcherInstance }
							patchers={ patchers }
						/>
						<ActionIcon.Group>
							<Tooltip label="Save Graph">
								<ActionIcon variant="default" size="lg" onClick={ onSaveCurrentSet } disabled={ !currentGraphSet || !currentGraphSetIsDirty } >
									<IconElement path={ mdiContentSave } />
								</ActionIcon>
							</Tooltip>
							<Tooltip label="Open Preset Menu">
								<ActionIcon onClick={ togglePresetDrawer } variant="default" size="lg" >
									<IconElement path={ mdiCamera } />
								</ActionIcon>
							</Tooltip>

							<GraphSetMenu

								hasLoadedGraph={ currentGraphSetId && currentGraphSetId !== UnsavedSetName }

								onLoadEmptySet={ onLoadEmptySet }
								onTriggerLoadSet={ onTriggerLoadSet }

								onDeleteCurrentSet={ onDeleteCurrentSet }
								onReloadCurrentSet={ onReloadCurrentSet }
								onSaveCurrentSet={ onSaveCurrentSet }
								onSaveCurrentSetAs={ onSaveCurrentSetAs }
								onTriggerRenameCurrentSet={ onRenameCurrentSet }
							/>
						</ActionIcon.Group>
					</Group>
				</Group>
				<GraphEditor
					nodeInfo={ nodeInfo }
					connections={ connections }
					ports={ ports }

					onConnect={ onConnectNodes }
					onNodesChange={ onNodesChange }
					onEdgesChange={ onEdgesChange }
					onRenameNode={ onRenameNode }

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
