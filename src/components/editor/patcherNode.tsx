import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import { GraphPatcherNodeRecord, GraphPortRecord, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { ActionIcon, Paper } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";

const EditorPatcherNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		node,
		contentHeight
	},
	selected
}) {
	const { query } = useRouter();
	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	return (
		<Paper className={ classes.node } shadow="sm" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				<div>
					{ (node as GraphPatcherNodeRecord).patcher }
				</div>
				<div>
					<ActionIcon
						component={ Link }
						href={{ pathname: "/devices/[index]", query: { ...query, index: (node as GraphPatcherNodeRecord).index } }}
						size="md"
						variant="transparent"
					>
						<FontAwesomeIcon icon={ faGamepad} />
					</ActionIcon>
				</div>
			</div>
			<div className={ classes.nodeContent } style={{ height: `${contentHeight}px` }} >
				{
					sinks.map((port, i) => <EditorPort key={ port.id } port={ port } offset={ calcPortOffset(sinks.length, i)}/>)
				}
				{
					sources.map((port, i) => <EditorPort key={ port.id } port={ port } offset={ calcPortOffset(sources.length, i) } />)
				}
			</div>
		</Paper>
	);
});

export default EditorPatcherNode;
