import { FC, useCallback } from "react";
import { ActionIcon, Group, Paper, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { ReceiveSlotControls, SendSlotControls } from "./slotControls";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import {
	resetLinkAudioSourceDropoutsOnRemote,
	triggerLinkAudioSinkNameOnRemote,
	triggerRemoveLinkAudioSinkOnRemote,
	triggerRemoveLinkAudioSourceOnRemote
} from "../../actions/linkAudio";
import { LinkAudioSinkRecord, LinkAudioSourceRecord } from "../../models/linkAudio";
import { IconElement } from "../elements/icon";
import { mdiRestart } from "@mdi/js";

export type LinkAudioSourceRowProps = {
	source: LinkAudioSourceRecord;
	first: boolean;
	last: boolean;
	// omitted when the list is too short to reorder
	onMove?: (key: string, delta: number) => void;
};

export const LinkAudioSourceRow: FC<LinkAudioSourceRowProps> = ({ source, first, last, onMove }) => {

	const dispatch = useAppDispatch();
	const onTriggerRemove = useCallback(() => {
		dispatch(triggerRemoveLinkAudioSourceOnRemote(source));
	}, [dispatch, source]);

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
							<SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" verticalSpacing={0} mt="xs" >
								<Text size="xs" c="dimmed" >Buffer: {Math.round(source.bufferedMs)} ms</Text>
								<Text size="xs" c="dimmed" >Jitter: {source.jitterMs.toFixed(1)} ms</Text>
								<Text size="xs" c="dimmed" >Behind: {Math.round(source.arrivalOffsetMs)} ms</Text>
								<Group gap={4} wrap="nowrap" align="flex-start" >
									<Text size="xs" c={source.dropouts > 0 ? "red" : "dimmed"} >Dropouts: {source.dropouts}</Text>
									<Tooltip label="Reset dropout count" >
										<ActionIcon variant="subtle" size="xs" onClick={onResetDropouts} aria-label="Reset dropout count" >
											<IconElement path={mdiRestart} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</SimpleGrid>
						) : null
					}
				</div>
				<ReceiveSlotControls
					first={ first }
					last={ last }
					onUp={ onMove ? onUp : undefined }
					onDown={ onMove ? onDown : undefined }
					onTriggerRemove={ onTriggerRemove }
				/>
			</Group>
		</Paper>
	);
};

export type LinkAudioSinkRowProps = {
	sink: LinkAudioSinkRecord;
	first: boolean;
	last: boolean;
	onMove?: (key: string, delta: number) => void;
};

export const LinkAudioSinkRow: FC<LinkAudioSinkRowProps> = ({ sink, first, last, onMove }) => {
	const dispatch = useAppDispatch();


	const onTriggerRename = useCallback(() => {
		dispatch(triggerLinkAudioSinkNameOnRemote(sink));
	}, [dispatch, sink]);

	const onTriggerRemove = useCallback(() => {
		dispatch(triggerRemoveLinkAudioSinkOnRemote(sink));
	}, [dispatch, sink]);

	const onUp = useCallback(() => onMove?.(sink.key, -1), [onMove, sink.key]);
	const onDown = useCallback(() => onMove?.(sink.key, 1), [onMove, sink.key]);

	return (
		<Paper withBorder p="sm" >
			<Group justify="space-between" align="flex-start" wrap="nowrap" >
				<Text fw={500} >{sink.name}</Text>
				<SendSlotControls
					first={ first }
					last={ last }
					onUp={ onMove ? onUp : undefined }
					onDown={ onMove ? onDown : undefined }
					onTriggerRename={ onTriggerRename }
					onTriggerRemove={ onTriggerRemove }
				/>
			</Group>
		</Paper>
	);
};
