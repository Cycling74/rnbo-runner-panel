import { Connection } from "reactflow";
import { Map as ImmuMap } from "immutable";
import Dagre from "@dagrejs/dagre";
import { RootStateType } from "./store";
import { GraphConnectionRecord, GraphNodeRecord, GraphPortRecord, NodePositionRecord } from "../models/graph";
import { defaultNodeGap } from "./constants";
import { EditorNodeDesc } from "../selectors/graph";

export const isValidConnection = (connection: Connection, ports: RootStateType["graph"]["ports"]): {
	sourcePort: GraphPortRecord;
	sinkPort: GraphPortRecord;
} => {

	if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
		throw new Error(`Invalid Connection Description (${connection.source}:${connection.sourceHandle} => ${connection.target}:${connection.targetHandle})`);
	}

	// Valid Connection?
	const sourcePort = ports.get(connection.sourceHandle);
	if (!sourcePort) throw new Error(`Invalid Source (${connection.sourceHandle})`);

	const sinkPort = ports.get(connection.targetHandle);
	if (!sinkPort) throw new Error(`Invalid Source (${connection.targetHandle})`);

	if (sourcePort.type !== sinkPort.type) throw new Error(`Invalid Connection Type (Can't connect ${sourcePort.type} to ${sinkPort.type})`);
	if (sourcePort.direction === sinkPort.direction) throw new Error("Invalid Connection");

	return { sourcePort, sinkPort };
};


export const calculateLayout = (
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>,
	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>,
	nodeInfo: ImmuMap<GraphNodeRecord["id"], EditorNodeDesc>
) => {

	const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
	g.setGraph({ align: "UL", ranksep: defaultNodeGap, nodesep: defaultNodeGap, rankdir: "LR" });

	connections.valueSeq().forEach(conn => {
		const srcId = ports.get(conn.sourcePortId)?.nodeId;
		const sinkId = ports.get(conn.sinkPortId)?.nodeId;
		if (srcId === undefined || sinkId === undefined) return;

		g.setEdge(srcId, sinkId);
	});

	nodeInfo.valueSeq().forEach(({ node, height, width }) => g.setNode(node.id, { height, width }));

	Dagre.layout(g);

	const positions: NodePositionRecord[] = nodeInfo.valueSeq().toArray().map(({ node, width, height }): NodePositionRecord => {
		// Shift from dagre anchor (center center) to reactflow anchor (top left)
		const newPos = g.node(node.id);
		return NodePositionRecord.fromDescription(node.id, newPos.x - (width / 2), newPos.y - (height / 2));
	});

	return positions;
};
