import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Controls, Edge, EdgeChange, Node, NodeChange } from "reactflow";
import { NodeType } from "../../models/graph";
import EditorPatcherNode from "./patcherNode";
import EditorSystemNode from "./systemNode";
import { EdgeDataProps, EditorEdgeProps, EditorNodeProps, NodeDataProps } from "./util";
import { isValidConnection } from "../../lib/editorUtils";
import { RootStateType } from "../../lib/store";

import "reactflow/dist/base.css";
import classes from "./editor.module.css";
import GraphEdge, { RNBOGraphEdgeType } from "./edge";
import { EditorEdgeRecord } from "../../models/editor";

export type GraphEditorProps = {
	graphConnections: RootStateType["graph"]["connections"];
	graphNodes: RootStateType["graph"]["nodes"];
	editorNodes: RootStateType["editor"]["nodes"];
	editorEdges: RootStateType["editor"]["edges"];
	onConnect: (connection: Connection) => any;
	onNodesDelete: (nodes: Pick<Edge, "id">[]) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesDelete: (edges: Pick<Edge, "id">[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
};

const nodeTypes: Record<NodeType, ComponentType<EditorNodeProps>> = {
	[NodeType.Patcher]: EditorPatcherNode,
	[NodeType.System]: EditorSystemNode
};

const edgeTypes: Record<typeof RNBOGraphEdgeType, ComponentType<EditorEdgeProps>> = {
	[RNBOGraphEdgeType]: GraphEdge
};

const GraphEditor: FunctionComponent<GraphEditorProps> = memo(function WrappedFlowGraph({
	graphConnections,
	graphNodes,
	editorNodes,
	editorEdges,
	onConnect,
	onNodesChange,
	onNodesDelete,
	onEdgesChange,
	onEdgesDelete
}) {

	// Validate Connection Directions and Types
	const validateConnection = useCallback((conn: Connection) => {
		try {
			return !!isValidConnection(conn, graphNodes);
		} catch (err) {
			return false;
		}
	}, [graphNodes]);

	const triggerDeleteEdge = useCallback((id: EditorEdgeRecord["id"]) => {
		onEdgesDelete([{ id }]);
	}, [onEdgesDelete]);

	const nodes: Node<NodeDataProps>[] = [];
	for (const editorNode of editorNodes.valueSeq().toArray()) {
		const graphNode = graphNodes.get(editorNode.id);
		if (!graphNode) continue;

		nodes.push({
			id: editorNode.id,
			position: {
				x: editorNode.x,
				y: editorNode.y
			},
			deletable: graphNode.type === NodeType.Patcher,
			selectable: graphNode.type === NodeType.Patcher,
			selected: editorNode.selected,
			type: graphNode?.type,
			data: {
				contentHeight: editorNode.contentHeight,
				node: graphNode
			}
		});
	}


	const edges: Edge<EdgeDataProps>[] = [];
	for (const connection of graphConnections.valueSeq().toArray()) {
		edges.push({
			id: connection.id,
			source: connection.sourceNodeId,
			sourceHandle: connection.sourcePortId,
			target: connection.sinkNodeId,
			targetHandle: connection.sinkPortId,
			type: RNBOGraphEdgeType,
			selected: editorEdges.get(connection.id)?.selected || false,
			data: {
				onDelete: triggerDeleteEdge
			}
		});
	}

	return (
		<div className={ classes.editor } >
			<ReactFlow
				isValidConnection={ validateConnection }
				edges={ edges }
				nodes={ nodes }
				onEdgesDelete={ onEdgesDelete }
				onEdgesChange={ onEdgesChange }
				onNodesDelete={ onNodesDelete }
				onNodesChange={ onNodesChange }
				onConnect={ onConnect }
				nodeTypes={ nodeTypes }
				edgeTypes={ edgeTypes }
				edgesUpdatable={ false }
				fitView
			>
				<Controls />
			</ReactFlow>
		</div>
	);
});

export default GraphEditor;
