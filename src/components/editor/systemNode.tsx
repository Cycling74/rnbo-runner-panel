import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcHandleOffset } from "./util";
import { GraphPortRecord, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { Paper } from "@mantine/core";

const EditorSystemNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: { node }
}) {

	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	return (
		<>
			{
				sinks.map((port, i) => <EditorPort key={ port.id} port={ port } offset={ calcHandleOffset(sinks.length, i) } />)
			}
			<Paper className={ classes.node }  shadow="sm" withBorder >
				{ node.name }
			</Paper>
			{
				sources.map((port, i) => <EditorPort key={ port.id } port={ port } offset={ calcHandleOffset(sources.length, i) } />)
			}
		</>
	);
});

export default EditorSystemNode;
