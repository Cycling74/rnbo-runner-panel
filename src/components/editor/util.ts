import { EdgeProps, NodeProps } from "reactflow";
import { GraphNodeRecord } from "../../models/graph";
import { EditorEdgeRecord, EditorNodeRecord } from "../../models/editor";

export type NodeDataProps = {
	node: GraphNodeRecord;
	contentHeight: EditorNodeRecord["contentHeight"];
};

export type EdgeDataProps = {
	onDelete: (id: EditorEdgeRecord["id"]) => void;
};

export type EditorNodeProps = NodeProps<NodeDataProps>;
export type EditorEdgeProps = EdgeProps<EdgeDataProps>;


export const calcPortOffset = (total: number, index: number): number => {
	return (index + 1) * (1 / (total + 1)) * 100;
};
