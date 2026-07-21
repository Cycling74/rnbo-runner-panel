import { ChangeEvent, FC, FocusEvent, useCallback, useEffect, useState } from "react";
import { Alert, Divider, Group, NumberInput, Paper, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { PageTitle } from "../components/page/title";
import {
	getLinkAudioAvailable, getLinkAudioLatencyMs, getLinkAudioPeerName, getLinkAudioPeers, getLinkAudioSinkCount, getLinkAudioSinks,
	getLinkAudioSourceCount, getLinkAudioSources, getLinkAudioSyncToIncoming, getLinkEnabled
} from "../selectors/linkAudio";
import {
	setLinkAudioLatencyMsOnRemote,
	setLinkAudioPeerNameOnRemote,
	setLinkAudioSinkCountOnRemote, setLinkAudioSinkNameOnRemote,
	setLinkAudioSourceCountOnRemote, setLinkAudioSourceSelectOnRemote,
	setLinkAudioSyncToIncomingOnRemote, setLinkEnabledOnRemote
} from "../actions/linkAudio";
import { getTransportLinkSync } from "../selectors/transport";
import { setTransportLinkSyncOnRemote } from "../actions/transport";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

const MAX_LINK_AUDIO_PAIRS = 64;
const SELECT_AUTO = "__auto__";

const encodeSelect = (peer: string, channel: string): string => JSON.stringify([peer, channel]);
const decodeSelect = (value: string): { peer: string; channel: string; } => {
	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) {
			return { peer: typeof parsed[0] === "string" ? parsed[0] : "", channel: typeof parsed[1] === "string" ? parsed[1] : "" };
		}
	} catch {
		// ignore
	}
	return { peer: "", channel: "" };
};

// On mobile, focusing an input in the lower half of the page pops up the on-screen keyboard,
// which can cover the focused field. Once the keyboard has animated in (~300ms), nudge the field
// toward the middle of the viewport so it stays visible above the keyboard. "center" keeps the
// input's label visible above it (unlike "start"). Touch devices only, so a mouse click on
// desktop doesn't trigger an unwanted scroll.
const scrollInputIntoView = (e: FocusEvent<HTMLInputElement>): void => {
	if (!window.matchMedia("(pointer: coarse)").matches) return;
	const el = e.currentTarget;
	window.setTimeout(() => {
		el.scrollIntoView({ behavior: "smooth", block: "center" });
	}, 300);
};

// Text input that syncs from redux but only commits (sends OSC) on blur / Enter.
const LinkAudioNameInput: FC<{ label: string; placeholder: string; value: string; onCommit: (v: string) => void; }> = ({ label, placeholder, value, onCommit }) => {
	const [local, setLocal] = useState<string>(value);
	useEffect(() => { setLocal(value); }, [value]);
	return (
		<TextInput
			label={ label }
			placeholder={ placeholder }
			value={ local }
			onChange={ e => setLocal(e.currentTarget.value) }
			onFocus={ scrollInputIntoView }
			onBlur={ () => { if (local !== value) onCommit(local); } }
			onKeyDown={ e => { if (e.key === "Enter") { e.currentTarget.blur(); } } }
			style={{ flex: 1 }}
		/>
	);
};

const LinkAudioSourceRow: FC<{ source: LinkAudioSourceRecord; peers: LinkAudioPeerInfo[]; }> = ({ source, peers }) => {
	const dispatch = useAppDispatch();

	const options: Array<{ value: string; label: string; }> = [{ value: SELECT_AUTO, label: "Auto (first available)" }];
	peers.forEach(p => p.channels.forEach(ch => options.push({ value: encodeSelect(p.peer, ch), label: `${p.peer} — ${ch}` })));

	const currentValue = (source.selectPeer.length || source.selectChannel.length)
		? encodeSelect(source.selectPeer, source.selectChannel)
		: SELECT_AUTO;

	// if the configured selection isn't currently advertised, still show it
	if (currentValue !== SELECT_AUTO && !options.some(o => o.value === currentValue)) {
		options.push({ value: currentValue, label: `${source.selectPeer} — ${source.selectChannel} (offline)` });
	}

	const onSelect = useCallback((value: string | null) => {
		if (!value || value === SELECT_AUTO) {
			dispatch(setLinkAudioSourceSelectOnRemote(source.index, "", ""));
		} else {
			const { peer, channel } = decodeSelect(value);
			dispatch(setLinkAudioSourceSelectOnRemote(source.index, peer, channel));
		}
	}, [dispatch, source.index]);

	const statusText = source.connected
		? `Connected: ${source.statusPeer || "?"} — ${source.statusChannel || "?"}`
		: "Not connected";

	return (
		<Paper withBorder p="sm" >
			<Select
				label={ `Source ${source.index + 1} — Link peer / channel` }
				data={ options }
				value={ currentValue }
				onChange={ onSelect }
				comboboxProps={{ withinPortal: true }}
			/>
			<Text size="xs" c={ source.connected ? "green" : "dimmed" } mt={ 4 } >{ statusText }</Text>
			{
				source.connected ? (
					<Group gap="md" mt={ 2 } >
						<Text size="xs" c="dimmed" >Buffer: { Math.round(source.bufferedMs) } ms</Text>
						<Text size="xs" c="dimmed" >Jitter: { source.jitterMs.toFixed(1) } ms</Text>
						<Text size="xs" c={ source.dropouts > 0 ? "red" : "dimmed" } >Dropouts: { source.dropouts }</Text>
					</Group>
				) : null
			}
		</Paper>
	);
};

const LinkAudioSinkRow: FC<{ sink: LinkAudioSinkRecord; }> = ({ sink }) => {
	const dispatch = useAppDispatch();
	const onName = useCallback((name: string) => {
		dispatch(setLinkAudioSinkNameOnRemote(sink.index, name));
	}, [dispatch, sink.index]);

	return (
		<Paper withBorder p="sm" >
			<LinkAudioNameInput
				label={ `Sink ${sink.index + 1} name (announced to Link)` }
				placeholder={ `Send ${sink.index + 1}` }
				value={ sink.name }
				onCommit={ onName }
			/>
		</Paper>
	);
};

export const LinkPage: FC<Record<never, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		available,
		linkEnabled,
		linkSync,
		peerName,
		peers,
		latencyMs,
		syncToIncoming,
		sourceCount,
		sinkCount,
		sources,
		sinks
	] = useAppSelector((state: RootStateType) => [
		getLinkAudioAvailable(state),
		getLinkEnabled(state),
		getTransportLinkSync(state),
		getLinkAudioPeerName(state),
		getLinkAudioPeers(state),
		getLinkAudioLatencyMs(state),
		getLinkAudioSyncToIncoming(state),
		getLinkAudioSourceCount(state),
		getLinkAudioSinkCount(state),
		getLinkAudioSources(state),
		getLinkAudioSinks(state)
	]);

	const onPeerName = useCallback((name: string) => {
		dispatch(setLinkAudioPeerNameOnRemote(name));
	}, [dispatch]);

	const onSourceCount = useCallback((value: string | number) => {
		const n = typeof value === "number" ? value : parseInt(value, 10);
		if (!Number.isNaN(n)) dispatch(setLinkAudioSourceCountOnRemote(n));
	}, [dispatch]);

	const onSinkCount = useCallback((value: string | number) => {
		const n = typeof value === "number" ? value : parseInt(value, 10);
		if (!Number.isNaN(n)) dispatch(setLinkAudioSinkCountOnRemote(n));
	}, [dispatch]);

	const onLatencyMs = useCallback((value: string | number) => {
		const n = typeof value === "number" ? value : parseFloat(value);
		if (!Number.isNaN(n)) dispatch(setLinkAudioLatencyMsOnRemote(n));
	}, [dispatch]);

	const onSyncToIncoming = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setLinkAudioSyncToIncomingOnRemote(e.currentTarget.checked));
	}, [dispatch]);

	const onLinkEnabled = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setLinkEnabledOnRemote(e.currentTarget.checked));
	}, [dispatch]);

	const onLinkSync = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setTransportLinkSyncOnRemote(e.currentTarget.checked));
	}, [dispatch]);

	// While a text field is focused on a touch device, pad the bottom of the page. scrollInputIntoView
	// centers the focused field, but a field near the bottom can't be lifted without content below it
	// to scroll into view; this padding provides that room so bottom fields (e.g. Sinks / sink names)
	// clear the on-screen keyboard. onFocus/onBlur bubble from any descendant field.
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

	// Session-level Link controls — shown regardless of Link Audio availability (they apply
	// whenever jack_transport_link is running, even with Link Audio disabled) so they stay reachable.
	const linkSessionControls = (
		<Stack gap="sm" >
			<Switch
				label="Link enabled"
				description="Join the Ableton Link session. When off, other Link peers don't see this device and tempo sync + Link Audio are inactive; the device still runs its own local transport."
				checked={ linkEnabled }
				onChange={ onLinkEnabled }
			/>
			<Switch
				label="Sync transport to Link"
				description="Follow the shared Ableton Link tempo and beat grid on the JACK transport. When off, the transport runs on its own tempo and ignores the Link session's timeline."
				checked={ linkSync }
				onChange={ onLinkSync }
				disabled={ !linkEnabled }
			/>
		</Stack>
	);

	// Device-level receive-health summary, derived from the per-source records.
	const connectedSources = sources.filter(s => s.connected).size;
	const totalDropouts = sources.reduce((acc, s) => acc + s.dropouts, 0);
	const maxJitter = sources.reduce((acc, s) => Math.max(acc, s.jitterMs), 0);

	if (!available) {
		return (
			<Stack gap="md" >
				<PageTitle>Link</PageTitle>
				{ linkSessionControls }
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

			{ linkSessionControls }

			{
				!hasPeers ? (
					<Alert color="blue" title="No Link Audio peers found on the network yet" >
						<Text size="sm" >Configure channels below; incoming sources connect automatically when a matching peer appears.</Text>
					</Alert>
				) : null
			}

			<Stack gap="sm" >
				<div>
					<Text fw={ 600 } >Link name</Text>
					<Text size="xs" c="dimmed" >Identifies this device in Ableton Live and to other Link peers. Clear to use the hostname.</Text>
				</div>
				<LinkAudioNameInput
					label=""
					placeholder="hostname"
					value={ peerName }
					onCommit={ onPeerName }
				/>
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<div>
					<Text fw={ 600 } >Receive buffer</Text>
					<Text size="xs" c="dimmed" >Playout delay for incoming audio, in milliseconds (converted to beats at the current tempo). Higher absorbs more network jitter; lower reduces latency but risks dropouts.</Text>
				</div>
				<Switch
					label="Sync to Incoming Audio"
					description="When on, the local timeline (transport / MIDI clock and generators locked to it) is delayed by the buffer below to match incoming audio, so they stay phase-aligned. When off, the local timeline runs live — incoming audio still plays (always buffered) but lags local generators by the buffer."
					checked={ syncToIncoming }
					onChange={ onSyncToIncoming }
				/>
				<NumberInput
					label="Buffer (ms)"
					min={ 0 }
					max={ 2000 }
					step={ 10 }
					value={ latencyMs }
					onChange={ onLatencyMs }
					onFocus={ scrollInputIntoView }
					allowDecimal={ false }
					style={{ width: 160 }}
				/>
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Sources</Text>
						<Text size="xs" c="dimmed" >Incoming from Link</Text>
					</div>
					<NumberInput
						label="Channels"
						min={ 0 }
						max={ MAX_LINK_AUDIO_PAIRS }
						value={ sourceCount }
						onChange={ onSourceCount }
						onFocus={ scrollInputIntoView }
						allowDecimal={ false }
						style={{ width: 120 }}
					/>
				</Group>
				{
					sources.size > 0 ? (
						<Paper withBorder p="sm" >
							<Group gap="xl" >
								<div>
									<Text size="xs" c="dimmed" >Connected</Text>
									<Text fw={ 600 } >{ connectedSources } / { sources.size }</Text>
								</div>
								<div>
									<Text size="xs" c="dimmed" >Total dropouts</Text>
									<Text fw={ 600 } c={ totalDropouts > 0 ? "red" : undefined } >{ totalDropouts }</Text>
								</div>
								<div>
									<Text size="xs" c="dimmed" >Worst jitter</Text>
									<Text fw={ 600 } >{ maxJitter.toFixed(1) } ms</Text>
								</div>
							</Group>
						</Paper>
					) : null
				}
				{
					sources.valueSeq().sortBy(s => s.index).map(source => (
						<LinkAudioSourceRow key={ source.id } source={ source } peers={ peers } />
					))
				}
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Sinks</Text>
						<Text size="xs" c="dimmed" >Outgoing to Link</Text>
					</div>
					<NumberInput
						label="Channels"
						min={ 0 }
						max={ MAX_LINK_AUDIO_PAIRS }
						value={ sinkCount }
						onChange={ onSinkCount }
						onFocus={ scrollInputIntoView }
						allowDecimal={ false }
						style={{ width: 120 }}
					/>
				</Group>
				{
					sinks.valueSeq().sortBy(s => s.index).map(sink => (
						<LinkAudioSinkRow key={ sink.id } sink={ sink } />
					))
				}
			</Stack>
		</Stack>
	);
};
