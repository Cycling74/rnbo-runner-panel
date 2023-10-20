import React, { ComponentType, FunctionComponent, memo, useCallback } from "react";
import ReactFlow, { Connection, Controls, Edge, Node } from "reactflow";
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
};

const nodeTypes: Record<NodeType, ComponentType<EditorNodeProps>> = {
	[NodeType.Patcher]: EditorPatcherNode,
	[NodeType.System]: EditorSystemNode
};

const GraphEditor: FunctionComponent<GraphEditorProps> = memo(function WrappedFlowGraph({
	connections,
	editorNodes,
	graphNodes,
	onConnect
}) {

	const onNodesChange = useCallback(() => {}, []);
	const onEdgesChange = useCallback(() => {}, []);

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
				x: editorNode?.x || 0,
				y: editorNode?.y || 0
			},
			type: graphNode?.type,
			data: { node: graphNode }
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
				onNodesChange={ onNodesChange }
				onEdgesChange={ onEdgesChange }
				onConnect={ onConnect }
				nodeTypes={ nodeTypes }
				fitView
			>
				<Controls />
			</ReactFlow>
		</div>
	);
});

export default GraphEditor;
