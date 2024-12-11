import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import { GraphPatcherNodeRecord, GraphPortRecord, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { ActionIcon, Paper, Tooltip } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconElement } from "../elements/icon";
import { mdiCogs } from "@mdi/js";

const EditorPatcherNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		node
	},
	selected
}) {
	const { query } = useRouter();
	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	const portSizeLimit = sinks.length && sources.length ? Math.round(300 / 2) : 300;

	return (
		<Paper className={ classes.node } shadow="md" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				<div>
					{ (node as GraphPatcherNodeRecord).index }: { (node as GraphPatcherNodeRecord).patcher }
				</div>
				<div>
					<Tooltip label="Open Patcher Instance Control">
						<ActionIcon
							component={ Link }
							href={{ pathname: "/instances/[index]", query: { ...query, index: (node as GraphPatcherNodeRecord).index } }}
							size="md"
							variant="transparent"
						>
							<IconElement path={ mdiCogs } />
						</ActionIcon>
					</Tooltip>
				</div>
			</div>
			<div className={ classes.nodeContent } style={{ height: `${node.contentHeight}px`, minWidth: 300 }} >
				{
					sinks.map((port, i) => (
						<EditorPort
							key={ port.id }
							port={ port }
							offset={ calcPortOffset(sinks.length, i)}
							maxWidth={ portSizeLimit }
						/>
					))
				}
				{
					sources.map((port, i) => (
						<EditorPort
							key={ port.id }
							port={ port }
							offset={ calcPortOffset(sources.length, i) }
							maxWidth={ portSizeLimit }
						/>
					))
				}
			</div>
		</Paper>
	);
});

export default EditorPatcherNode;
