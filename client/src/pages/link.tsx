import { ChangeEvent, FC, FocusEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ActionIcon, Alert, Button, Divider, Group, Menu, Modal, NumberInput, Paper, Stack, Switch, Text, TextInput, Tooltip } from "@mantine/core";
import { mdiArrowDown, mdiArrowUp, mdiPlus, mdiRestart, mdiTrashCan } from "@mdi/js";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { PageTitle } from "../components/page/title";
import { IconElement } from "../components/elements/icon";
import {
	getLinkAudioAvailable, getLinkAudioLatencyMs, getLinkAudioPeerName, getLinkAudioPeers,
	getLinkAudioSinksOrdered, getLinkAudioSourcesOrdered, getLinkAudioSyncToIncoming, getLinkEnabled
} from "../selectors/linkAudio";
import {
	addLinkAudioSinkOnRemote, addLinkAudioSourceOnRemote,
	removeLinkAudioSinkOnRemote, removeLinkAudioSourceOnRemote,
	resetLinkAudioSourceDropoutsOnRemote,
	setLinkAudioLatencyMsOnRemote, setLinkAudioPeerNameOnRemote,
	setLinkAudioSinkNameOnRemote, setLinkAudioSinkOrderOnRemote,
	setLinkAudioSourceOrderOnRemote, setLinkAudioSyncToIncomingOnRemote, setLinkEnabledOnRemote
} from "../actions/linkAudio";
import { getTransportLinkSync } from "../selectors/transport";
import { setTransportLinkSyncOnRemote } from "../actions/transport";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

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
const LinkAudioNameInput: FC<{ label: string; placeholder: string; value: string; error?: (v: string) => string | null; onCommit: (v: string) => void; }> = ({ label, placeholder, value, error, onCommit }) => {
	const [local, setLocal] = useState<string>(value);
	useEffect(() => { setLocal(value); }, [value]);
	const err = local === value ? null : (error ? error(local) : null);
	return (
		<TextInput
			label={ label }
			placeholder={ placeholder }
			value={ local }
			error={ err }
			onChange={ e => setLocal(e.currentTarget.value) }
			onFocus={ scrollInputIntoView }
			onBlur={ () => { if (local !== value && !(error && error(local))) onCommit(local); else setLocal(value); } }
			onKeyDown={ e => { if (e.key === "Enter") { e.currentTarget.blur(); } } }
			style={{ flex: 1 }}
		/>
	);
};

// Up / down / delete controls shared by both row types. Reorder is buttons rather than
// drag-and-drop: no new dependency, and it works on the Move's touch screen.
const SlotControls: FC<{ first: boolean; last: boolean; onUp: () => void; onDown: () => void; onRemove: () => void; }> = ({ first, last, onUp, onDown, onRemove }) => (
	<Group gap="xs" wrap="nowrap" >
		<ActionIcon variant="default" disabled={ first } onClick={ onUp } aria-label="Move up" >
			<IconElement path={ mdiArrowUp } />
		</ActionIcon>
		<ActionIcon variant="default" disabled={ last } onClick={ onDown } aria-label="Move down" >
			<IconElement path={ mdiArrowDown } />
		</ActionIcon>
		<ActionIcon variant="default" color="red" onClick={ onRemove } aria-label="Remove" >
			<IconElement path={ mdiTrashCan } />
		</ActionIcon>
	</Group>
);

const LinkAudioSourceRow: FC<{
	source: LinkAudioSourceRecord;
	first: boolean;
	last: boolean;
	onMove: (key: string, delta: number) => void;
}> = ({ source, first, last, onMove }) => {
	const dispatch = useAppDispatch();

	// No confirmation: re-adding is a single click, and the slot's ports are derived from its
	// identity so nothing is lost by removing it.
	const onRemove = useCallback(() => {
		dispatch(removeLinkAudioSourceOnRemote(source.peer, source.channel));
	}, [dispatch, source.peer, source.channel]);

	const onUp = useCallback(() => onMove(source.key, -1), [onMove, source.key]);
	const onDown = useCallback(() => onMove(source.key, 1), [onMove, source.key]);

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
						// A connected source that isn't rendering produces pure silence, and the
						// dropout count stays at 0 (it only counts starves once playback has
						// started) — so say so, and name the actual cause. `unmappable` counts
						// buffers that did arrive but carried a beat stamp from another Link
						// session, which no Latency value can fix.
						silent ? (
							<Text size="xs" c="dimmed" mt={ 2 } >
								{
									source.unmappable > 0
										? "Audio is arriving but is stamped for a different Link session, so it can't be beat-aligned. Check that this device and the sender are in the same Link session (Link enabled on both, same network)."
										: "No audio is arriving yet. If the sender is playing, the playout buffer may be too small for this network — raise Latency above."
								}
							</Text>
						) : null
					}
					{
						source.connected ? (
							<Group gap="md" mt={ 2 } align="center" >
								<Text size="xs" c="dimmed" >Buffer: { Math.round(source.bufferedMs) } ms</Text>
								<Text size="xs" c="dimmed" >Jitter: { source.jitterMs.toFixed(1) } ms</Text>
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
				<SlotControls first={ first } last={ last } onUp={ onUp } onDown={ onDown } onRemove={ onRemove } />
			</Group>
		</Paper>
	);
};

const LinkAudioSinkRow: FC<{
	sink: LinkAudioSinkRecord;
	usedNames: string[];
	first: boolean;
	last: boolean;
	onMove: (key: string, delta: number) => void;
}> = ({ sink, usedNames, first, last, onMove }) => {
	const dispatch = useAppDispatch();

	const onName = useCallback((name: string) => {
		dispatch(setLinkAudioSinkNameOnRemote(sink.key, name));
	}, [dispatch, sink.key]);

	const onRemove = useCallback(() => {
		dispatch(removeLinkAudioSinkOnRemote(sink.name));
	}, [dispatch, sink.name]);

	const onUp = useCallback(() => onMove(sink.key, -1), [onMove, sink.key]);
	const onDown = useCallback(() => onMove(sink.key, 1), [onMove, sink.key]);

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
				<SlotControls first={ first } last={ last } onUp={ onUp } onDown={ onDown } onRemove={ onRemove } />
			</Group>
		</Paper>
	);
};

const AddSinkModal: FC<{ open: boolean; usedNames: string[]; onClose: () => void; }> = ({ open, usedNames, onClose }) => {
	const dispatch = useAppDispatch();

	// prefill with the first unused "Send <n>"
	const suggested = useMemo(() => {
		for (let i = 1; ; i++) {
			const name = `Send ${i}`;
			if (!usedNames.includes(name)) return name;
		}
	}, [usedNames]);

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
		<Modal opened={ open } onClose={ onClose } title="Add Sink" >
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

const AddSourceMenu: FC<{ peers: LinkAudioPeerInfo[]; sources: LinkAudioSourceRecord[]; }> = ({ peers, sources }) => {
	const dispatch = useAppDispatch();
	const onAdd = useCallback((peer: string, channel: string) => {
		dispatch(addLinkAudioSourceOnRemote(peer, channel));
	}, [dispatch]);

	return (
		<Menu withinPortal position="bottom-end" >
			<Menu.Target>
				<Button leftSection={ <IconElement path={ mdiPlus } /> } variant="default" disabled={ !peers.length } >
					Add Source
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{
					peers.map(p => (
						<div key={ p.peer } >
							<Menu.Label>{ p.peer }</Menu.Label>
							{
								p.channels.map(ch => (
									<Menu.Item
										key={ `${p.peer}/${ch}` }
										disabled={ sources.some(s => s.peer === p.peer && s.channel === ch) }
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
		getLinkAudioSourcesOrdered(state),
		getLinkAudioSinksOrdered(state)
	]);

	const [addSinkOpen, setAddSinkOpen] = useState<boolean>(false);

	const onPeerName = useCallback((name: string) => {
		dispatch(setLinkAudioPeerNameOnRemote(name));
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

	// Reorder writes the whole key list back, with the moved slot swapped with its neighbour.
	// Returns the list unchanged when the move isn't possible (the buttons are disabled at the
	// ends, so that's belt-and-braces).
	const swapped = (keys: string[], key: string, delta: number): string[] => {
		const from = keys.indexOf(key);
		const to = from + delta;
		if (from < 0 || to < 0 || to >= keys.length) return keys;
		const next = keys.slice();
		next[from] = keys[to];
		next[to] = key;
		return next;
	};

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

	const onResetAllDropouts = useCallback(() => {
		dispatch(resetLinkAudioSourceDropoutsOnRemote());
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
				description="Join the Ableton Link session. When off, other Link peers don't see this device, Link Audio is inactive and the device runs its own local transport."
				checked={ linkEnabled }
				onChange={ onLinkEnabled }
			/>
			<Switch
				label="Sync transport to Link"
				description="Follow the shared Ableton Link tempo and beat grid with JACK's transport. When off, the transport runs with its own tempo and ignores the Link session's timeline."
				checked={ linkSync }
				onChange={ onLinkSync }
				disabled={ !linkEnabled }
			/>
		</Stack>
	);

	// Device-level receive-health summary, derived from the per-source records.
	const connectedSources = sources.filter(s => s.connected).length;
	const totalDropouts = sources.reduce((acc, s) => acc + s.dropouts, 0);
	const maxJitter = sources.reduce((acc, s) => Math.max(acc, s.jitterMs), 0);
	const sinkNames = sinks.map(s => s.name);

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

			<Stack gap="sm" >
				<div>
					<Text fw={ 600 } >Link name</Text>
					<Text size="xs" c="dimmed" >Identifies this device to other Link peers. Clear to use the hostname.</Text>
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
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Latency</Text>
						<Text size="xs" c="dimmed" >Larger absorbs network jitter, lower risks dropouts.</Text>
					</div>
					<NumberInput
						label="Buffer (ms)"
						min={ 0 }
						max={ 2000 }
						step={ 10 }
						value={ latencyMs }
						onChange={ onLatencyMs }
						onFocus={ scrollInputIntoView }
						allowDecimal={ false }
						style={{ width: 120 }}
					/>
				</Group>
				<Switch
					label="Sync to Incoming Audio"
					description="Delay the local transport timeline to align with incoming audio."
					checked={ syncToIncoming }
					onChange={ onSyncToIncoming }
				/>
			</Stack>

			<Divider />

			<Stack gap="sm" >
				<Group justify="space-between" align="flex-end" wrap="nowrap" >
					<div>
						<Text fw={ 600 } >Sources</Text>
						<Text size="xs" c="dimmed" >Incoming from Link</Text>
					</div>
					<AddSourceMenu peers={ peers } sources={ sources } />
				</Group>
				{
					!hasPeers ? (
						<Alert color="blue" title="No Link Audio peers found on the network yet" >
							<Text size="sm" >Once a peer advertises a channel it shows up under Add Source. Nothing connects until you pick it.</Text>
						</Alert>
					) : null
				}
				{
					sources.length > 0 ? (
						<Paper withBorder p="sm" >
							<Group gap="xl" justify="space-between" align="center" >
								<Group gap="xl" >
									<div>
										<Text size="xs" c="dimmed" >Connected</Text>
										<Text fw={ 600 } >{ connectedSources } / { sources.length }</Text>
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
								<Tooltip label="Zero every source's dropout count, to measure from now" >
									<Button
										variant="default"
										size="compact-sm"
										leftSection={ <IconElement path={ mdiRestart } /> }
										onClick={ onResetAllDropouts }
									>
										Reset dropouts
									</Button>
								</Tooltip>
							</Group>
						</Paper>
					) : null
				}
				{
					sources.map((source, i) => (
						<LinkAudioSourceRow
							key={ source.id }
							source={ source }
							first={ i === 0 }
							last={ i === sources.length - 1 }
							onMove={ onMoveSource }
						/>
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
					<Button leftSection={ <IconElement path={ mdiPlus } /> } variant="default" onClick={ () => setAddSinkOpen(true) } >
						Add Sink
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
							onMove={ onMoveSink }
						/>
					))
				}
			</Stack>

			<AddSinkModal open={ addSinkOpen } usedNames={ sinkNames } onClose={ () => setAddSinkOpen(false) } />
		</Stack>
	);
};
