import { EdgeProps, NodeProps } from "reactflow";
import { GraphConnectionRecord, GraphNodeRecord, GraphPortRecord } from "../../models/graph";

export type NodeActions = {
	onDelete: (node: GraphNodeRecord) => void;
	onRename: (node: GraphNodeRecord) => void;
};

export type NodeDataProps = NodeActions & {
	contentHeight: number;
	displayName: string;
	node: GraphNodeRecord;
	sinks: GraphPortRecord[];
	sources: GraphPortRecord[];
	x: number;
	y: number;
	width: number;
	height: number;
};

export type PatcherNodeDataProps = NodeDataProps & {
	onRename: (node: GraphNodeRecord) => void;
};

export type EdgeDataProps = {
	onDelete: (id: GraphConnectionRecord["id"]) => void;
};

export type EditorNodeProps = NodeProps<NodeDataProps>;
export type EditorEdgeProps = EdgeProps<EdgeDataProps>;

export const calcPortOffset = (total: number, index: number): number => {
	return (index + 1) * (1 / (total + 1)) * 100;
};
