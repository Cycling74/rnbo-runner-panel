import { Map as ImmuMap } from "immutable";
import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowInstance } from "reactflow";
import { GraphConnectionRecord, GraphNodeRecord, NodeType } from "../../models/graph";
import EditorPatcherNode from "./patcherNode";
import EditorSystemNode from "./systemNode";
import { EdgeDataProps, EditorEdgeProps, EditorNodeProps, NodeDataProps } from "./util";
import { isValidConnection } from "../../lib/editorUtils";
import { RootStateType } from "../../lib/store";

import "reactflow/dist/base.css";
import classes from "./editor.module.css";
import GraphEdge, { RNBOGraphEdgeType } from "./edge";
import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiFitToScreen, mdiLock, mdiLockOpen, mdiMinus, mdiPlus, mdiSitemap } from "@mdi/js";
import { maxEditorZoom, minEditorZoom } from "../../lib/constants";
import { EditorNodeDesc } from "../../selectors/graph";
import { getHotkeyHandler } from "@mantine/hooks";
import { useLocation, useNavigate } from "react-router";

export type GraphEditorProps = {
	connections: RootStateType["graph"]["connections"];
	nodeInfo: ImmuMap<GraphNodeRecord["id"], EditorNodeDesc>;
	ports: RootStateType["graph"]["ports"];

	onConnect: (connection: Connection) => any;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onRenameNode: (node: GraphNodeRecord) => void;

	zoom: number;
	locked: boolean;
	onInit: (instance: ReactFlowInstance) => void;
	onFitView: () => void;
	onAutoLayout: () => void;
	onToggleLocked: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
};

const nodeTypes: Record<NodeType, ComponentType<EditorNodeProps>> = {
	[NodeType.Patcher]: EditorPatcherNode,
	[NodeType.System]: EditorSystemNode
};

const edgeTypes: Record<typeof RNBOGraphEdgeType, ComponentType<EditorEdgeProps>> = {
	[RNBOGraphEdgeType]: GraphEdge
};

const GraphEditor: FunctionComponent<GraphEditorProps> = memo(function WrappedFlowGraph({
	connections,

	onConnect,
	onNodesChange,
	onEdgesChange,
	onRenameNode,

	nodeInfo,
	ports,
	onInit,
	onFitView,
	onAutoLayout,
	locked,
	onToggleLocked,
	zoom,
	onZoomIn,
	onZoomOut
}) {

	const { colorScheme } = useMantineColorScheme();
	const { search } = useLocation();
	const navigate = useNavigate();

	// Validate Connection Directions and Types
	const validateConnection = useCallback((conn: Connection) => {
		try {
			return !!isValidConnection(conn, ports);
		} catch (err) {
			return false;
		}
	}, [ports]);

	const triggerDeleteEdge = useCallback((id: GraphConnectionRecord["id"]) => {
		onEdgesChange([{ id, type: "remove" }]);
	}, [onEdgesChange]);

	const handleHotKeyDelete = useCallback(() => {
		const edgeChanges: EdgeChange[] = connections.valueSeq().filter(c => c.selected).toArray().map(c => ({ id: c.id, type: "remove" }));
		if (edgeChanges.length) onEdgesChange(edgeChanges);

		const nodeChanges: NodeChange[] = nodeInfo.valueSeq().filter(info => info.node.selected).toArray().map(info => ({ id: info.node.id, type: "remove" }));
		if (nodeChanges.length) onNodesChange(nodeChanges);
	}, [connections, nodeInfo, onEdgesChange, onNodesChange]);

	const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node<NodeDataProps>) => {
		if (node.type !== NodeType.Patcher) return;
		navigate({ pathname: `/instances/${encodeURIComponent(node.data.node.instanceId)}`, search });
	}, [search, navigate]);

	const onDeleteNode = useCallback((node: GraphNodeRecord) => {
		if (node.type !== NodeType.Patcher) return;
		onNodesChange([{ id: node.id, type: "remove" }]);
	}, [onNodesChange]);

	const flowNodes: Node<NodeDataProps>[] = nodeInfo.valueSeq().toArray().map(({
		node,
		x,
		y,
		...info
	}) => {
		return {
			id: node.id,
			position: {
				x: x,
				y: y
			},
			deletable: node.type === NodeType.Patcher,
			selected: node.selected,
			type: node?.type,
			data: {
				onDelete: onDeleteNode,
				onRename: onRenameNode,
				node,
				x,
				y,
				...info
			},
			style: { height: info.height, width: info.width }
		};
	});

	const flowEdges: Edge<EdgeDataProps>[] = connections.valueSeq().toArray().map(connection => ({
		id: connection.id,
		source: ports.get(connection.sourcePortId).nodeId,
		sourceHandle: connection.sourcePortId,
		target: ports.get(connection.sinkPortId).nodeId,
		targetHandle: connection.sinkPortId,
		type: RNBOGraphEdgeType,
		selected: connection.selected,
		data: {
			onDelete: triggerDeleteEdge
		}
	}));

	return (
		<div className={ classes.editor } data-color-scheme={ colorScheme } >
			<ReactFlow
				isValidConnection={ validateConnection }
				deleteKeyCode={[]}
				edges={ flowEdges }
				nodes={ flowNodes }
				onEdgesChange={ onEdgesChange }
				onNodesChange={ onNodesChange }
				onNodeDoubleClick={ onNodeDoubleClick }
				onConnect={ onConnect }
				nodeTypes={ nodeTypes }
				edgeTypes={ edgeTypes }
				edgesUpdatable={ false }
				fitView
				onInit={ onInit }
				minZoom={ minEditorZoom }
				maxZoom={ maxEditorZoom }
				nodesFocusable={ !locked }
				nodesDraggable={ !locked }
				nodesConnectable={ !locked }
				edgesFocusable={ !locked }
				elementsSelectable={ !locked }
				onKeyDown={ getHotkeyHandler([
					["backspace", handleHotKeyDelete]
				]) }
			/>
			<div className={ classes.controls } >
				<ActionIcon.Group orientation="vertical">
					<Tooltip label="Zoom in" position="right" >
						<ActionIcon variant="default" disabled={ zoom >= maxEditorZoom } onClick={ onZoomIn } >
							<IconElement path={ mdiPlus } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Zoom out" position="right" >
						<ActionIcon variant="default" disabled={ zoom <= minEditorZoom } onClick={ onZoomOut } >
							<IconElement path={ mdiMinus } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Fit graph into view" position="right" >
						<ActionIcon variant="default" onClick={ onFitView }>
							<IconElement path={ mdiFitToScreen } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={ locked ? "Unlock graph" : "Lock graph" } position="right" >
						<ActionIcon variant="default" onClick={ onToggleLocked } >
							<IconElement path={ locked ? mdiLock : mdiLockOpen } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Auto Layout" position="right" >
						<ActionIcon variant="default" onClick={ onAutoLayout } >
							<IconElement path={ mdiSitemap } rotate={ -90 } />
						</ActionIcon>
					</Tooltip>
				</ActionIcon.Group>
			</div>
		</div>
	);
});

export default GraphEditor;
