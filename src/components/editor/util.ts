import { NodeProps } from "reactflow";
import { GraphNodeRecord } from "../../models/graph";
import { EditorNodeRecord } from "../../models/editor";

export type EditorNodeProps = NodeProps<{
	node: GraphNodeRecord;
	contentHeight: EditorNodeRecord["contentHeight"];
}>

export const calcPortOffset = (total: number, index: number): number => {
	return (index + 1) * (1 / (total + 1)) * 100;
};
