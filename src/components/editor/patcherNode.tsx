import React, { FunctionComponent, memo, useCallback } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { ActionIcon, Menu, Paper, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiDotsVertical, mdiPencil, mdiTrashCan, mdiVectorSquare } from "@mdi/js";
import { Link, useLocation } from "react-router";

const EditorPatcherNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		onDelete,
		onRename,

		contentHeight,
		displayName,
		node,
		sinks,
		sources,
		width
	},
	selected
}) {

	const { search } = useLocation();
	const portSizeLimit = sinks.length && sources.length ? Math.round(width / 2) : width;

	const onTriggerRename = useCallback(() => {
		onRename(node);
	}, [onRename, node]);

	const onTriggerDelete = useCallback(() => {
		onDelete(node);
	}, [onDelete, node]);

	return (
		<Paper className={ classes.node } shadow="md" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				<div>{ displayName }</div>
				<div>
					<Menu position="bottom-end" >
						<Menu.Target>
							<Tooltip label="Open Device Actions">
								<ActionIcon variant="default" >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>
								Device Actions
							</Menu.Label>
							<Menu.Item leftSection={ <IconElement path={ mdiVectorSquare } /> } component={ Link } to={{ pathname: `/instances/${encodeURIComponent(node.instanceId)}`, search }} >
								Open Device Control
							</Menu.Item>
							<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ onTriggerRename } >
								Rename Device
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onTriggerDelete } >
								Delete Device
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
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
