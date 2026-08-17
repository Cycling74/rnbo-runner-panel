import { ChangeEvent, FC, ReactNode, memo, useCallback } from "react";
import { Alert, Button, NumberInput, Paper, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { mdiRestart } from "@mdi/js";
import classes from "./settings.module.css";
import linkClasses from "./linkPanel.module.css";
import { IconElement } from "../elements/icon";
import { LinkAudioNameInput, scrollInputIntoView } from "../linkAudio/nameInput";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import {
	getLinkAudioAvailable, getLinkAudioLatencyMs, getLinkAudioPeerName,
	getLinkAudioSourcesOrdered, getLinkAudioSyncToIncoming, getLinkEnabled
} from "../../selectors/linkAudio";
import {
	resetLinkAudioSourceDropoutsOnRemote, setLinkAudioLatencyMsOnRemote,
	setLinkAudioPeerNameOnRemote, setLinkAudioSyncToIncomingOnRemote, setLinkEnabledOnRemote
} from "../../actions/linkAudio";
import { getTransportLinkSync } from "../../selectors/transport";
import { setTransportLinkSyncOnRemote } from "../../actions/transport";

// Matches the title-left / control-right layout SettingsItem renders, so this hand-built panel
// sits flush with the generic tabs. Link state lives in state.linkAudio rather than in the
// runner config, so it can't go through SettingsList.
const SettingRow: FC<{ title: string; description?: string; children: ReactNode; }> = ({ title, description, children }) => (
	<div className={ classes.item } >
		<div className={ classes.itemTitleWrap } >
			<label className={ classes.itemTitle } >{ title }</label>
			{ description?.length ? <div className={ classes.itemDescription } >{ description }</div> : null }
		</div>
		<div className={ classes.itemInputWrap } >
			{ children }
		</div>
	</div>
);

export const LinkSettingsPanel: FC<Record<never, never>> = memo(function WrappedLinkSettingsPanel() {

	const dispatch = useAppDispatch();
	const [
		available,
		linkEnabled,
		linkSync,
		peerName,
		latencyMs,
		syncToIncoming,
		sources
	] = useAppSelector((state: RootStateType) => [
		getLinkAudioAvailable(state),
		getLinkEnabled(state),
		getTransportLinkSync(state),
		getLinkAudioPeerName(state),
		getLinkAudioLatencyMs(state),
		getLinkAudioSyncToIncoming(state),
		getLinkAudioSourcesOrdered(state)
	]);

	const onLinkEnabled = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setLinkEnabledOnRemote(e.currentTarget.checked));
	}, [dispatch]);

	const onLinkSync = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setTransportLinkSyncOnRemote(e.currentTarget.checked));
	}, [dispatch]);

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

	const onResetAllDropouts = useCallback(() => {
		dispatch(resetLinkAudioSourceDropoutsOnRemote());
	}, [dispatch]);

	const connectedSources = sources.filter(s => s.connected).length;
	const totalDropouts = sources.reduce((acc, s) => acc + s.dropouts, 0);
	const maxJitter = sources.reduce((acc, s) => Math.max(acc, s.jitterMs), 0);

	// Session controls apply whenever jack_transport_link is running, even with Link Audio
	// disabled, so they stay reachable regardless of `available`.
	return (
		<Stack gap="sm" >
			<SettingRow
				title="Link enabled"
				description="Join the Ableton Link session. When off, other Link peers don't see this device, Link Audio is inactive and the device runs its own local transport."
			>
				<Switch checked={ linkEnabled } onChange={ onLinkEnabled } size="md" />
			</SettingRow>
			<SettingRow
				title="Sync transport to Link"
				description="Follow the shared Ableton Link tempo and beat grid with JACK's transport. When off, the transport runs with its own tempo and ignores the Link session's timeline."
			>
				<Switch checked={ linkSync } onChange={ onLinkSync } disabled={ !linkEnabled } size="md" />
			</SettingRow>
			<SettingRow
				title="Link name"
				description="Identifies this device to other Link peers. Clear to use the hostname."
			>
				<LinkAudioNameInput
					label=""
					placeholder="hostname"
					value={ peerName }
					onCommit={ onPeerName }
				/>
			</SettingRow>
			{
				!available ? (
					<Alert color="yellow" title="Link Audio is not available" >
						<Text size="sm" >
							<code>jack_transport_link</code> is not running, or it was started with Link Audio disabled.
							Start it with Link Audio enabled to stream beat-aligned audio to and from other Ableton Link peers.
						</Text>
					</Alert>
				) : (
					<>
						<SettingRow
							title="Latency"
							description="Buffer in ms. Larger absorbs network jitter, lower risks dropouts."
						>
							<NumberInput
								min={ 0 }
								max={ 2000 }
								step={ 10 }
								value={ latencyMs }
								onChange={ onLatencyMs }
								onFocus={ scrollInputIntoView }
								allowDecimal={ false }
								style={{ width: 120 }}
							/>
						</SettingRow>
						<SettingRow
							title="Sync to Incoming Audio"
							description="Delay the local transport timeline to align with incoming audio."
						>
							<Switch checked={ syncToIncoming } onChange={ onSyncToIncoming } size="md" />
						</SettingRow>
						{
							// Status, not a setting: it needs the full row width, so it sits outside
							// SettingRow rather than inside itemInputWrap's 250px control column.
						}
						<Stack gap="xs" >
							<div>
								<div className={ classes.itemTitle } >Receive health</div>
								<div className={ classes.itemDescription } >
									Across every Receive. Per-channel detail lives on the Link device pages.
								</div>
							</div>
							<Paper withBorder p="sm" >
								<div className={ linkClasses.health } >
									<div className={ linkClasses.healthStats } >
										<div>
											<Text size="xs" c="dimmed" >Connected</Text>
											<Text fw={ 600 } >{ connectedSources } / { sources.length }</Text>
										</div>
										<div>
											<Text size="xs" c="dimmed" >Dropouts</Text>
											<Text fw={ 600 } c={ totalDropouts > 0 ? "red" : undefined } >{ totalDropouts }</Text>
										</div>
										<div>
											<Text size="xs" c="dimmed" >Worst jitter</Text>
											<Text fw={ 600 } >{ maxJitter.toFixed(1) } ms</Text>
										</div>
									</div>
									<Tooltip label="Zero every Receive's dropout count, to measure from now" >
										<Button
											className={ linkClasses.healthReset }
											variant="default"
											size="compact-sm"
											leftSection={ <IconElement path={ mdiRestart } /> }
											onClick={ onResetAllDropouts }
											disabled={ !sources.length }
										>
											Reset dropouts
										</Button>
									</Tooltip>
								</div>
							</Paper>
						</Stack>
					</>
				)
			}
		</Stack>
	);
});
