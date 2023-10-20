import { NodeProps } from "reactflow";
import { GraphNodeRecord } from "../../models/graph";

export type EditorNodeProps = NodeProps<{
	node: GraphNodeRecord;
}>

export const calcHandleOffset = (total: number, index: number): number => {
	return (index + 1) * (1 / (total + 1));
};
