import { FunctionComponent, memo, useCallback } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { ActionIcon, Menu, Paper, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiCastAudio, mdiDotsVertical, mdiTrashCan } from "@mdi/js";
import { Link, useLocation } from "react-router";
import { linkDevicePath } from "../../lib/deviceRoutes";

// Same shape as the patcher node, minus rename: a Link node's name is its port group, which
// jack_transport_link derives from the peer (or is the fixed Sends group), so there is nothing
// here for the user to rename.
const EditorLinkAudioNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphLinkAudioNode({
	data: {
		onDelete,

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
							<Tooltip label="Open Link Actions">
								<ActionIcon variant="default" >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>
								Link Actions
							</Menu.Label>
							<Menu.Item leftSection={ <IconElement path={ mdiCastAudio } /> } component={ Link } to={{ pathname: linkDevicePath(node.id), search }} >
								Open Link Control
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

export default EditorLinkAudioNode;
