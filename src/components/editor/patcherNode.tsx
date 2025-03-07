import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { ActionIcon, Paper, Tooltip } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconElement } from "../elements/icon";
import { mdiCogs } from "@mdi/js";

const EditorPatcherNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		contentHeight,
		node,
		sinks,
		sources,
		width
	},
	selected
}) {

	const { query } = useRouter();
	const portSizeLimit = sinks.length && sources.length ? Math.round(width / 2) : width;

	return (
		<Paper className={ classes.node } shadow="md" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				<div>{ node.displayName }</div>
				<div>
					<Tooltip label="Open Device Control">
						<ActionIcon
							component={ Link }
							href={{ pathname: "/instances/[id]", query: { ...query, id: node.instanceId } }}
							size="md"
							variant="transparent"
						>
							<IconElement path={ mdiCogs } />
						</ActionIcon>
					</Tooltip>
				</div>
			</div>
			<div className={ classes.nodeContent } style={{ height: `${contentHeight}px` }} >
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
