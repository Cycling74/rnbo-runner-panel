import React, { FunctionComponent, useCallback } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import classes from "./editor.module.css";
import { ActionIcon, CloseIcon } from "@mantine/core";
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
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
					}}
				>
					<ActionIcon onClick={ onTriggerDelete } >
						<CloseIcon />
					</ActionIcon>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default GraphEdge;
