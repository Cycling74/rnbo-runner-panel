import { FC, useCallback } from "react";
import { ActionIcon, Group, Paper, Text, Tooltip } from "@mantine/core";
import { mdiRestart } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { LinkAudioNameInput } from "./nameInput";
import { SlotControls } from "./slotControls";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import {
	removeLinkAudioSinkOnRemote, removeLinkAudioSourceOnRemote,
	resetLinkAudioSourceDropoutsOnRemote, setLinkAudioSinkNameOnRemote
} from "../../actions/linkAudio";
import { LinkAudioSinkRecord, LinkAudioSourceRecord } from "../../models/linkAudio";

export type LinkAudioSourceRowProps = {
	source: LinkAudioSourceRecord;
	first: boolean;
	last: boolean;
	// omitted when the list is too short to reorder
	onMove?: (key: string, delta: number) => void;
};

export const LinkAudioSourceRow: FC<LinkAudioSourceRowProps> = ({ source, first, last, onMove }) => {
	const dispatch = useAppDispatch();

	// No confirmation: re-adding is a single click, and the slot's ports are derived from its
	// identity so nothing is lost by removing it.
	const onRemove = useCallback(() => {
		dispatch(removeLinkAudioSourceOnRemote(source.peer, source.channel));
	}, [dispatch, source.peer, source.channel]);

	const onUp = useCallback(() => onMove?.(source.key, -1), [onMove, source.key]);
	const onDown = useCallback(() => onMove?.(source.key, 1), [onMove, source.key]);

	const onResetDropouts = useCallback(() => {
		dispatch(resetLinkAudioSourceDropoutsOnRemote(source.key));
	}, [dispatch, source.key]);

	// Subscribed to a live channel but rendering nothing.
	const silent = source.connected && !source.receiving;
	const statusText = source.connected
		? (source.receiving ? "Connected" : "Connected, but receiving no audio")
		: "Not connected";
	const statusColor = source.connected ? (source.receiving ? "green" : "yellow") : "dimmed";

	return (
		<Paper withBorder p="sm" >
			<Group justify="space-between" align="flex-start" wrap="nowrap" >
				<div>
					<Text fw={ 500 } >{ source.label }</Text>
					<Text size="xs" c={ statusColor } mt={ 4 } >{ statusText }</Text>
					{
						// A connected source that isn't rendering produces pure silence while the
						// dropout count stays at 0, since dropouts are only counted once playback
						// has started. Say so, and quote the measured arrival offset, which is the
						// actionable number.
						silent ? (
							<Text size="xs" c="dimmed" mt={ 2 } >
								{
									source.arrivalOffsetMs > 0
										? `Audio is arriving ${Math.round(source.arrivalOffsetMs)} ms behind the live beat, so Latency has to be above that for any of it to play. If that seems high, check the sender's own latency and "sync to incoming audio" settings — a sender that delays its transport stamps its outgoing audio with the delayed beat, and you pay for it here.`
										: "No audio is arriving yet. Check that the sender is actually playing, and that it and this device are in the same Link session."
								}
							</Text>
						) : null
					}
					{
						source.connected ? (
							<Group gap="md" mt={ 2 } align="center" >
								<Text size="xs" c="dimmed" >Buffer: { Math.round(source.bufferedMs) } ms</Text>
								<Text size="xs" c="dimmed" >Jitter: { source.jitterMs.toFixed(1) } ms</Text>
								<Text size="xs" c="dimmed" >Behind: { Math.round(source.arrivalOffsetMs) } ms</Text>
								<Group gap={ 4 } wrap="nowrap" align="center" >
									<Text size="xs" c={ source.dropouts > 0 ? "red" : "dimmed" } >Dropouts: { source.dropouts }</Text>
									<Tooltip label="Reset dropout count" >
										<ActionIcon variant="subtle" size="sm" onClick={ onResetDropouts } aria-label="Reset dropout count" >
											<IconElement path={ mdiRestart } />
										</ActionIcon>
									</Tooltip>
								</Group>
							</Group>
						) : null
					}
				</div>
				<SlotControls
					first={ first }
					last={ last }
					onUp={ onMove ? onUp : undefined }
					onDown={ onMove ? onDown : undefined }
					onRemove={ onRemove }
				/>
			</Group>
		</Paper>
	);
};

export type LinkAudioSinkRowProps = {
	sink: LinkAudioSinkRecord;
	usedNames: string[];
	first: boolean;
	last: boolean;
	onMove?: (key: string, delta: number) => void;
};

export const LinkAudioSinkRow: FC<LinkAudioSinkRowProps> = ({ sink, usedNames, first, last, onMove }) => {
	const dispatch = useAppDispatch();

	const onName = useCallback((name: string) => {
		dispatch(setLinkAudioSinkNameOnRemote(sink.key, name));
	}, [dispatch, sink.key]);

	const onRemove = useCallback(() => {
		dispatch(removeLinkAudioSinkOnRemote(sink.name));
	}, [dispatch, sink.name]);

	const onUp = useCallback(() => onMove?.(sink.key, -1), [onMove, sink.key]);
	const onDown = useCallback(() => onMove?.(sink.key, 1), [onMove, sink.key]);

	// jack_transport_link rejects an empty or colliding name, so catch it here for a real
	// error message instead of a silently reverted field.
	const validate = useCallback((v: string): string | null => {
		if (!v.trim().length) return "Name is required";
		if (usedNames.some(n => n !== sink.name && n === v)) return "That name is already used";
		return null;
	}, [usedNames, sink.name]);

	return (
		<Paper withBorder p="sm" >
			<Group align="flex-end" wrap="nowrap" >
				<LinkAudioNameInput
					label="Channel Name"
					placeholder="Channel name"
					value={ sink.name }
					error={ validate }
					onCommit={ onName }
				/>
				<SlotControls
					first={ first }
					last={ last }
					onUp={ onMove ? onUp : undefined }
					onDown={ onMove ? onDown : undefined }
					onRemove={ onRemove }
				/>
			</Group>
		</Paper>
	);
};
