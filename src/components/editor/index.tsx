import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Controls, Edge, EdgeChange, Node, NodeChange } from "reactflow";
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
import { useMantineColorScheme } from "@mantine/core";
import { FitView } from "./fitView";

export type GraphEditorProps = {
	connections: RootStateType["graph"]["connections"];
	nodes: RootStateType["graph"]["nodes"];
	onConnect: (connection: Connection) => any;
	onNodesDelete: (nodes: Pick<Edge, "id">[]) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesDelete: (edges: Pick<Edge, "id">[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
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
	nodes,
	onConnect,
	onNodesChange,
	onNodesDelete,
	onEdgesChange,
	onEdgesDelete
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
		push({ pathname: "/instances/[index]", query: { ...query, index: (node.data.node as GraphPatcherNodeRecord).index }});
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
		data: {
			node
		}
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
				minZoom={ 0.1 }
				maxZoom={ 5 }
			>
				<Controls />
				<FitView />
			</ReactFlow>
		</div>
	);
});

export default GraphEditor;
