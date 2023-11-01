import React, { FunctionComponent, useCallback } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import classes from "./editor.module.css";
import { CloseButton } from "@mantine/core";
import { EditorEdgeProps } from "./util";

export const RNBOGraphEdgeType = "rnbo-edge";

const GraphEdge: FunctionComponent<EditorEdgeProps> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	selected,
	sourcePosition,
	targetPosition,
	data: { onDelete }
}) => {

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	const onTriggerDelete = useCallback(() => onDelete(id), [id, onDelete]);

	return (
		<>
			<BaseEdge id={ id } path={ edgePath } />
			<EdgeLabelRenderer>
				<div
					className={ `nodrag nopan ${classes.edgeLabel}` }
					style={{
						display: selected ? "initial" : "none",
						transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`
					}}
				>
					<CloseButton onClick={ onTriggerDelete } />
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default GraphEdge;
