import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcHandleOffset } from "./util";
import { GraphPatcherNodeRecord, GraphPortRecord, NodeType, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { Button, Paper } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";

const EditorPatcherNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: { node }
}) {
	const { query } = useRouter();
	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	return (
		<>
			{
				sinks.map((port, i) => <EditorPort key={ port.id} port={ port } offset={ calcHandleOffset(sinks.length, i)}/>)
			}
			<Paper className={ classes.node } shadow="sm" withBorder >
				<div>
					{ (node as GraphPatcherNodeRecord).index }: { (node as GraphPatcherNodeRecord).patcher }
				</div>
				<Button
					component={ Link }
					href={{ pathname: "/devices/[index]", query: { ...query, index: (node as GraphPatcherNodeRecord).index } }}
					size="xs"
					variant="default"
					leftSection={ <FontAwesomeIcon icon={ faGamepad} /> }
				>
					Control
				</Button>
			</Paper>
			{
				sources.map((port, i) => <EditorPort key={ port.id } port={ port } offset={ calcHandleOffset(sources.length, i) } />)
			}
		</>
	);
});

export default EditorPatcherNode;
