import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Group, Menu, Modal, Stack, TextInput } from "@mantine/core";
import { mdiCheck, mdiPlus } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addLinkAudioSinkOnRemote, addLinkAudioSourceOnRemote } from "../../actions/linkAudio";
import { LinkAudioPeerInfo, LinkAudioSourceRecord } from "../../models/linkAudio";

// Suggest the first unused "Send <n>".
export const suggestSinkName = (usedNames: string[]): string => {
	for (let i = 1; ; i++) {
		const name = `Send ${i}`;
		if (!usedNames.includes(name)) return name;
	}
};

export type AddSinkModalProps = {
	open: boolean;
	usedNames: string[];
	onClose: () => void;
};

// Sinks are "Sends" in the UI. The model, actions and OSC paths stay on jack_transport_link's
// own vocabulary (sinks/sources); only what the user reads is renamed.
export const AddSinkModal: FC<AddSinkModalProps> = ({ open, usedNames, onClose }) => {
	const dispatch = useAppDispatch();

	const suggested = useMemo(() => suggestSinkName(usedNames), [usedNames]);

	const [name, setName] = useState<string>(suggested);
	useEffect(() => { if (open) setName(suggested); }, [open, suggested]);

	const error = !name.trim().length
		? "Name is required"
		: (usedNames.includes(name) ? "That name is already used" : null);

	const onSubmit = useCallback(() => {
		if (error) return;
		dispatch(addLinkAudioSinkOnRemote(name));
		onClose();
	}, [dispatch, error, name, onClose]);

	return (
		<Modal opened={ open } onClose={ onClose } title="Add Send" >
			<Stack gap="md" >
				<TextInput
					label="Channel Name"
					description="Announced to the Link session so other peers can subscribe to it."
					data-autofocus
					value={ name }
					error={ error }
					onChange={ e => setName(e.currentTarget.value) }
					onKeyDown={ e => { if (e.key === "Enter") onSubmit(); } }
				/>
				<Group justify="flex-end" >
					<Button variant="default" onClick={ onClose } >Cancel</Button>
					<Button onClick={ onSubmit } disabled={ !!error } >Add</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

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
