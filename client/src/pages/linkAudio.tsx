import { FC, useCallback, useEffect, useState } from "react";
import { Alert, Divider, NumberInput, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { PageTitle } from "../components/page/title";
import {
	getLinkAudioAvailable, getLinkAudioPeerName, getLinkAudioPeers, getLinkAudioSinkCount, getLinkAudioSinks,
	getLinkAudioSourceCount, getLinkAudioSources
} from "../selectors/linkAudio";
import {
	setLinkAudioPeerNameOnRemote,
	setLinkAudioSinkCountOnRemote, setLinkAudioSinkNameOnRemote,
	setLinkAudioSourceCountOnRemote, setLinkAudioSourceSelectOnRemote
} from "../actions/linkAudio";
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

export const LinkAudioPage: FC<Record<never, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		available,
		peerName,
		peers,
		sourceCount,
		sinkCount,
		sources,
		sinks
	] = useAppSelector((state: RootStateType) => [
		getLinkAudioAvailable(state),
		getLinkAudioPeerName(state),
		getLinkAudioPeers(state),
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

	if (!available) {
		return (
			<Stack gap="md" >
				<PageTitle>Link Audio</PageTitle>
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
		<Stack gap="lg" >
			<PageTitle>Link Audio</PageTitle>

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
					<Text fw={ 600 } >Sources</Text>
					<Text size="xs" c="dimmed" >Incoming from Link</Text>
				</div>
				<NumberInput
					label="Number of source channels"
					min={ 0 }
					max={ MAX_LINK_AUDIO_PAIRS }
					value={ sourceCount }
					onChange={ onSourceCount }
					allowDecimal={ false }
					style={{ maxWidth: 220 }}
				/>
				{
					sources.valueSeq().sortBy(s => s.index).map(source => (
						<LinkAudioSourceRow key={ source.id } source={ source } peers={ peers } />
					))
				}
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<div>
					<Text fw={ 600 } >Sinks</Text>
					<Text size="xs" c="dimmed" >Outgoing to Link</Text>
				</div>
				<NumberInput
					label="Number of sink channels"
					min={ 0 }
					max={ MAX_LINK_AUDIO_PAIRS }
					value={ sinkCount }
					onChange={ onSinkCount }
					allowDecimal={ false }
					style={{ maxWidth: 220 }}
				/>
				{
					sinks.valueSeq().sortBy(s => s.index).map(sink => (
						<LinkAudioSinkRow key={ sink.id } sink={ sink } />
					))
				}
			</Stack>
		</Stack>
	);
};
