import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { Paper } from "@mantine/core";

const EditorSystemNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		contentHeight,
		displayName,
		sinks,
		sources,
		width
	},
	selected
}) {

	const portSizeLimit = sinks.length && sources.length ? Math.round(width / 2) : width;

	return (
		<Paper className={ classes.node }  shadow="md" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				{ displayName }
			</div>
			<div className={ classes.nodeContent } style={{ height: `${contentHeight}px` }} >
				{
					sinks.map((port, i) => (
						<EditorPort
							key={ port.id }
							port={ port }
							offset={ calcPortOffset(sinks.length, i) }
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

export default EditorSystemNode;
