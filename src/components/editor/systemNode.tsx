import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import { GraphPortRecord, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { Paper } from "@mantine/core";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getPortAliasesForNode } from "../../selectors/graph";

const EditorSystemNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		node
	},
	selected
}) {

	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	const aliases = useAppSelector((state: RootStateType) => getPortAliasesForNode(state, node));
	const portSizeLimit = sinks.length && sources.length ? Math.round(node.width / 2) : node.width;

	return (
		<Paper className={ classes.node }  shadow="md" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				{ node.jackName }
			</div>
			<div className={ classes.nodeContent } style={{ height: `${node.contentHeight}px` }} >
				{
					sinks.map((port, i) => (
						<EditorPort
							key={ port.id }
							port={ port }
							offset={ calcPortOffset(sinks.length, i) }
							alias={ aliases.get(port.portName) }
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
							alias={ aliases.get(port.portName) }
							maxWidth={ portSizeLimit }
						/>
					))
				}
			</div>
		</Paper>
	);
});

export default EditorSystemNode;
