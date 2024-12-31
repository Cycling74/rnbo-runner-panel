import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowInstance } from "reactflow";
import { GraphConnectionRecord, GraphPatcherNodeRecord, NodeType } from "../../models/graph";
import EditorPatcherNode from "./patcherNode";
import EditorSystemNode from "./systemNode";
import { EdgeDataProps, EditorEdgeProps, EditorNodeProps, NodeDataProps } from "./util";
import { isValidConnection } from "../../lib/editorUtils";
import { RootStateType } from "../../lib/store";

import "reactflow/dist/base.css";
import classes from "./editor.module.css";
import GraphEdge, { RNBOGraphEdgeType } from "./edge";
import { useRouter } from "next/router";
import EditorControlNode from "./controlNode";
import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiFitToScreen, mdiLock, mdiLockOpen, mdiMinus, mdiPlus, mdiSitemap } from "@mdi/js";
import { maxEditorZoom, minEditorZoom } from "../../lib/constants";

export type GraphEditorProps = {
	connections: RootStateType["graph"]["connections"];
	nodes: RootStateType["graph"]["nodes"];

	onConnect: (connection: Connection) => any;
	onNodesDelete: (nodes: Pick<Edge, "id">[]) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesDelete: (edges: Pick<Edge, "id">[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;

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
	[NodeType.Control]: EditorControlNode,
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
	onNodesDelete,
	onEdgesChange,
	onEdgesDelete,

	nodes,
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
	const { push, query } = useRouter();

	// Validate Connection Directions and Types
	const validateConnection = useCallback((conn: Connection) => {
		try {
			return !!isValidConnection(conn, nodes);
		} catch (err) {
			return false;
		}
	}, [nodes]);

	const triggerDeleteEdge = useCallback((id: GraphConnectionRecord["id"]) => {
		onEdgesDelete([{ id }]);
	}, [onEdgesDelete]);

	const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node<NodeDataProps>) => {
		if (node.type !== NodeType.Patcher) return;
		push({ pathname: "/instances/[index]", query: { ...query, index: (node.data.node as GraphPatcherNodeRecord).instanceId }});
	}, [query, push]);

	const flowNodes: Node<NodeDataProps>[] = nodes.valueSeq().toArray().map(node => ({
		id: node.id,
		position: {
			x: node.x,
			y: node.y
		},
		deletable: node.type === NodeType.Patcher,
		selected: node.selected,
		type: node?.type,
		data: { node },
		style: { height: node.height, width: node.width }
	}));

	const flowEdges: Edge<EdgeDataProps>[] = connections.valueSeq().toArray().map(connection => ({
		id: connection.id,
		source: connection.sourceNodeId,
		sourceHandle: connection.sourcePortId,
		target: connection.sinkNodeId,
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
				edges={ flowEdges }
				nodes={ flowNodes }
				onEdgesDelete={ onEdgesDelete }
				onEdgesChange={ onEdgesChange }
				onNodesDelete={ onNodesDelete }
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
