import { FC, FocusEvent, useCallback, useState } from "react";
import { Alert, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { mdiPlus } from "@mdi/js";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { PageTitle } from "../components/page/title";
import { IconElement } from "../components/elements/icon";
import {
	getLinkAudioAvailable, getLinkAudioPeers,
	getLinkAudioSinksOrdered, getLinkAudioSourcesOrdered
} from "../selectors/linkAudio";
import { setLinkAudioSinkOrderOnRemote, setLinkAudioSourceOrderOnRemote } from "../actions/linkAudio";
import { AddSinkModal, AddSourceMenu } from "../components/linkAudio/addSlot";
import { LinkAudioSinkRow, LinkAudioSourceRow } from "../components/linkAudio/rows";
import { swapped } from "../lib/linkAudio";

export const LinkPage: FC<Record<never, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		available,
		peers,
		sources,
		sinks
	] = useAppSelector((state: RootStateType) => [
		getLinkAudioAvailable(state),
		getLinkAudioPeers(state),
		getLinkAudioSourcesOrdered(state),
		getLinkAudioSinksOrdered(state)
	]);

	const [addSinkOpen, setAddSinkOpen] = useState<boolean>(false);

	const onMoveSource = useCallback((key: string, delta: number) => {
		const keys = sources.map(s => s.key);
		const next = swapped(keys, key, delta);
		if (next !== keys) dispatch(setLinkAudioSourceOrderOnRemote(next));
	}, [dispatch, sources]);

	const onMoveSink = useCallback((key: string, delta: number) => {
		const keys = sinks.map(s => s.key);
		const next = swapped(keys, key, delta);
		if (next !== keys) dispatch(setLinkAudioSinkOrderOnRemote(next));
	}, [dispatch, sinks]);

	// While a text field is focused on a touch device, pad the bottom of the page. scrollInputIntoView
	// centers the focused field, but a field near the bottom can't be lifted without content below it
	// to scroll into view; this padding provides that room so bottom fields (e.g. Send names) clear
	// the on-screen keyboard. onFocus/onBlur bubble from any descendant field.
	const [keyboardPad, setKeyboardPad] = useState<boolean>(false);
	const onFieldFocusIn = useCallback((e: FocusEvent<HTMLDivElement>) => {
		const t = e.target;
		const isTextField =
			(t instanceof HTMLInputElement && t.type !== "checkbox" && t.type !== "radio" && !t.readOnly)
			|| t instanceof HTMLTextAreaElement;
		if (isTextField && window.matchMedia("(pointer: coarse)").matches) setKeyboardPad(true);
	}, []);
	const onFieldFocusOut = useCallback((e: FocusEvent<HTMLDivElement>) => {
		// keep the padding while focus moves between fields; drop it once focus leaves the page
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardPad(false);
	}, []);

	const sinkNames = sinks.map(s => s.name);

	if (!available) {
		return (
			<Stack gap="md" >
				<PageTitle>Link</PageTitle>
				<Alert color="yellow" title="Link Audio is not available" >
					<Text size="sm" >
						<code>jack_transport_link</code> is not running, or it was started with Link Audio disabled.
						Start it with Link Audio enabled to stream beat-aligned audio to and from other Ableton Link peers.
					</Text>
				</Alert>
			</Stack>
		);
	}

	const hasPeers = peers.length > 0;

	return (
		<Stack gap="lg" onFocus={ onFieldFocusIn } onBlur={ onFieldFocusOut } style={ keyboardPad ? { paddingBottom: "60vh" } : undefined } >
			<PageTitle>Link</PageTitle>

			<Stack gap="sm" >
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Receives</Text>
						<Text size="xs" c="dimmed" >Incoming from Link</Text>
					</div>
					<AddSourceMenu peers={ peers } sources={ sources } />
				</Group>
				{
					!hasPeers ? (
						<Alert color="blue" title="No Link Audio peers found on the network yet" >
							<Text size="sm" >Once a peer advertises a channel it shows up under Add Receive. Nothing connects until you pick it.</Text>
						</Alert>
					) : null
				}
				{
					sources.map((source, i) => (
						<LinkAudioSourceRow
							key={ source.id }
							source={ source }
							first={ i === 0 }
							last={ i === sources.length - 1 }
							onMove={ sources.length > 1 ? onMoveSource : undefined }
						/>
					))
				}
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Sends</Text>
						<Text size="xs" c="dimmed" >Outgoing to Link</Text>
					</div>
					<Button leftSection={ <IconElement path={ mdiPlus } /> } variant="default" onClick={ () => setAddSinkOpen(true) } >
						Add Send
					</Button>
				</Group>
				{
					sinks.map((sink, i) => (
						<LinkAudioSinkRow
							key={ sink.id }
							sink={ sink }
							usedNames={ sinkNames }
							first={ i === 0 }
							last={ i === sinks.length - 1 }
							onMove={ sinks.length > 1 ? onMoveSink : undefined }
						/>
					))
				}
			</Stack>

			<AddSinkModal open={ addSinkOpen } usedNames={ sinkNames } onClose={ () => setAddSinkOpen(false) } />
		</Stack>
	);
};
