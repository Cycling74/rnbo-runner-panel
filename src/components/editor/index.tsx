import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Controls, Edge, Node, NodeChange } from "reactflow";
import { NodeType } from "../../models/graph";
import EditorPatcherNode from "./patcherNode";
import EditorSystemNode from "./systemNode";
import { EditorNodeProps } from "./util";
import { isValidConnection } from "../../lib/editorUtils";
import { RootStateType } from "../../lib/store";

import "reactflow/dist/base.css";
import classes from "./editor.module.css";

export type GraphEditorProps = {
	connections: RootStateType["graph"]["connections"];
	editorNodes: RootStateType["editor"]["nodes"];
	graphNodes: RootStateType["graph"]["nodes"];
	onConnect: (connection: Connection) => any;
	onNodesDelete: (nodes: Node[]) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesDelete: (edges: Edge[]) => void;
};

const nodeTypes: Record<NodeType, ComponentType<EditorNodeProps>> = {
	[NodeType.Patcher]: EditorPatcherNode,
	[NodeType.System]: EditorSystemNode
};

const GraphEditor: FunctionComponent<GraphEditorProps> = memo(function WrappedFlowGraph({
	connections,
	editorNodes,
	graphNodes,
	onConnect,
	onNodesChange,
	onNodesDelete,
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

	const nodes: Node[] = [];
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
			draggable: graphNode.type === NodeType.Patcher,
			selectable: graphNode.type === NodeType.Patcher,
			selected: editorNode.selected,
			type: graphNode?.type,
			data: {
				contentHeight: editorNode.contentHeight,
				node: graphNode
			}
		});
	}


	const edges: Edge[] = [];
	for (const connection of connections.valueSeq().toArray()) {
		edges.push({
			id: connection.id,
			source: connection.sourceNodeId,
			sourceHandle: connection.sourcePortId,
			target: connection.sinkNodeId,
			targetHandle: connection.sinkPortId
		});
	}

	return (
		<div className={ classes.editor } >
			<ReactFlow
				isValidConnection={ validateConnection }
				edges={ edges }
				nodes={ nodes }
				onEdgesDelete={ onEdgesDelete }
				onNodesDelete={ onNodesDelete }
				onNodesChange={ onNodesChange }
				onConnect={ onConnect }
				nodeTypes={ nodeTypes }
				edgesUpdatable={ false }
				fitView
			>
				<Controls />
			</ReactFlow>
		</div>
	);
});

export default GraphEditor;
