import { Connection } from "reactflow";
import { RootStateType } from "./store";
import { GraphNodeRecord, GraphPortRecord } from "../models/graph";

export const isValidConnection = (connection: Connection, nodes: RootStateType["graph"]["nodes"]): {
	sourceNode: GraphNodeRecord;
	sourcePort: GraphPortRecord;
	sinkNode: GraphNodeRecord;
	sinkPort: GraphPortRecord;
} => {

	if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
		throw new Error(`Invalid Connection Description (${connection.source}:${connection.sourceHandle} => ${connection.target}:${connection.targetHandle})`);
	}

	// Valid Connection?
	const sourceNode = nodes.get(connection.source);
	if (!sourceNode) throw new Error(`Invalid Source Node Id (${connection.source})`);

	const sourcePort = sourceNode.getPort(connection.sourceHandle);
	if (!sourcePort) throw new Error(`Invalid Source Port (${connection.sourceHandle} on ${connection.source})`);

	const sinkNode = nodes.get(connection.target);
	if (!sinkNode) throw new Error(`Invalid Target Node Id (${connection.target})`);

	const sinkPort = sinkNode.getPort(connection.targetHandle);
	if (!sinkPort) throw new Error(`Invalid Source Port (${connection.targetHandle} on ${connection.target})`);

	if (sourcePort.type !== sinkPort.type) throw new Error(`Invalid Connection Type (Can't connect ${sourcePort.type} to ${sinkPort.type})`);
	if (sourcePort.direction === sinkPort.direction) throw new Error("Invalid Connection");

	return {
		sourceNode,
		sourcePort,
		sinkNode,
		sinkPort
	};
};
