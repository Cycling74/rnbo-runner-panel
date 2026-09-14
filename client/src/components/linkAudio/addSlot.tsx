import { FC, useCallback, useMemo } from "react";
import { Button, Menu } from "@mantine/core";
import { mdiCheck, mdiPlus } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addLinkAudioSourceOnRemote } from "../../actions/linkAudio";
import { LinkAudioPeerInfo, LinkAudioSourceRecord } from "../../models/linkAudio";

export type AddSourceMenuProps = {
	// the peers to offer: every peer in the graph editor, or just this device's peer on its own page
	peers: LinkAudioPeerInfo[];
	// every Receive in the graph, so a channel already taken can be marked as such
	sources: LinkAudioSourceRecord[];
};

// Sources are "Receives" in the UI. A channel already taken by a source slot stays listed, disabled
// and check-marked, rather than disappearing from the list under the user's click.
export const AddSourceMenu: FC<AddSourceMenuProps> = ({ peers, sources }) => {
	const dispatch = useAppDispatch();
	const onAdd = useCallback((peer: string, channel: string) => {
		dispatch(addLinkAudioSourceOnRemote(peer, channel));
	}, [dispatch]);

	const isAdded = useCallback((peer: string, channel: string) => {
		return sources.some(s => s.peer === peer && s.channel === channel);
	}, [sources]);

	// nothing left to add is the same as nothing to offer, as far as the button is concerned
	const anyAvailable = useMemo(() => {
		return peers.some(p => p.channels.some(ch => !sources.some(s => s.peer === p.peer && s.channel === ch)));
	}, [peers, sources]);

	return (
		<Menu withinPortal position="bottom-end" >
			<Menu.Target>
				<Button leftSection={ <IconElement path={ mdiPlus } /> } variant="default" disabled={ !anyAvailable } >
					Add Receive
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{
					peers.map(p => (
						<div key={ p.peer } >
							{ /* one peer is the device-page case, where the page title already names it */ }
							{ peers.length > 1 ? <Menu.Label>{ p.peer }</Menu.Label> : null }
							{
								p.channels.map(ch => (
									<Menu.Item
										key={ `${p.peer}/${ch}` }
										disabled={ isAdded(p.peer, ch) }
										rightSection={ isAdded(p.peer, ch) ? <IconElement path={ mdiCheck } /> : undefined }
										onClick={ () => onAdd(p.peer, ch) }
									>
										{ ch }
									</Menu.Item>
								))
							}
						</div>
					))
				}
			</Menu.Dropdown>
		</Menu>
	);
};
