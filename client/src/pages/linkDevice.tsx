import { FC, FocusEvent, useCallback, useState } from "react";
import { ActionIcon, Alert, Button, Group, Menu, Stack, Text, Tooltip } from "@mantine/core";
import { mdiChartSankeyVariant, mdiDotsVertical, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import classes from "../components/instance/instance.module.css";
import { IconElement } from "../components/elements/icon";
import { DeviceSelectTitle } from "../components/instance/deviceTitle";
import { linkDeviceValue } from "../lib/deviceRoutes";
import { getPatcherInstances } from "../selectors/patchers";
import { getLinkDevice, getLinkDevices, LinkDeviceKind } from "../selectors/linkDevices";
import {
	getLinkAudioSinkOrder, getLinkAudioSinks,
	getLinkAudioSourceOrder, getLinkAudioSources
} from "../selectors/linkAudio";
import { setLinkAudioSinkOrderOnRemote, setLinkAudioSourceOrderOnRemote } from "../actions/linkAudio";
import { LinkAudioSinkRow, LinkAudioSourceRow } from "../components/linkAudio/rows";
import { AddSinkModal } from "../components/linkAudio/addSlot";
import { swappedWithin } from "../lib/linkAudio";
import { removeLinkDeviceOnRemote } from "../actions/linkDevices";
import { getAppStatus } from "../selectors/appStatus";
import { AppStatus } from "../lib/constants";

export const LinkDevicePage: FC<Record<never, never>> = () => {

	const { search } = useLocation();
	const navigate = useNavigate();
	const { nodeId: rawNodeId } = useParams();
	const nodeId = decodeURIComponent(Array.isArray(rawNodeId) ? rawNodeId.join("") : rawNodeId || "");

	const dispatch = useAppDispatch();

	const [
		appStatus,
		device,
		linkDevices,
		instances,
		sources,
		sinks,
		sourceOrder,
		sinkOrder
	] = useAppSelector((state: RootStateType) => [
		getAppStatus(state),
		getLinkDevice(state, nodeId),
		getLinkDevices(state),
		getPatcherInstances(state),
		getLinkAudioSources(state),
		getLinkAudioSinks(state),
		getLinkAudioSourceOrder(state),
		getLinkAudioSinkOrder(state)
	]);

	const [addSinkOpen, setAddSinkOpen] = useState<boolean>(false);

	const onChangeDevice = useCallback((pathname: string) => {
		navigate({ pathname, search });
	}, [navigate, search]);

	// same confirm and the same fan-out as deleting the node in the graph; that thunk routes back
	// to the graph once it's done, since this page is about to have no device behind it
	const onDeleteDevice = useCallback(() => {
		dispatch(removeLinkDeviceOnRemote(nodeId));
	}, [dispatch, nodeId]);

	// A device's slots are a subset of one global order list, so a move here has to be spliced
	// back into that list rather than replacing it.
	const onMoveSource = useCallback((key: string, delta: number) => {
		if (!device) return;
		const next = swappedWithin(sourceOrder, device.slotKeys, key, delta);
		if (next !== sourceOrder) dispatch(setLinkAudioSourceOrderOnRemote(next));
	}, [dispatch, device, sourceOrder]);

	const onMoveSink = useCallback((key: string, delta: number) => {
		if (!device) return;
		const next = swappedWithin(sinkOrder, device.slotKeys, key, delta);
		if (next !== sinkOrder) dispatch(setLinkAudioSinkOrderOnRemote(next));
	}, [dispatch, device, sinkOrder]);

	// While a text field is focused on a touch device, pad the bottom of the page so the focused
	// field can be scrolled clear of the on-screen keyboard.
	const [keyboardPad, setKeyboardPad] = useState<boolean>(false);
	const onFieldFocusIn = useCallback((e: FocusEvent<HTMLDivElement>) => {
		const t = e.target;
		const isTextField =
			(t instanceof HTMLInputElement && t.type !== "checkbox" && t.type !== "radio" && !t.readOnly)
			|| t instanceof HTMLTextAreaElement;
		if (isTextField && window.matchMedia("(pointer: coarse)").matches) setKeyboardPad(true);
	}, []);
	const onFieldFocusOut = useCallback((e: FocusEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardPad(false);
	}, []);

	if (appStatus !== AppStatus.Ready) return null;

	if (!device) {
		return (
			<div className={ classes.instanceNotFound } >
				<h2>Link Device Not Found</h2>
				<Button
					component={ Link }
					to={{ pathname: "/", search }}
					leftSection={ <IconElement path={ mdiChartSankeyVariant } /> }
					variant="outline"
					color="gray"
				>
					Back to Graph
				</Button>
			</div>
		);
	}

	const isSend = device.kind === LinkDeviceKind.Send;
	// reorder only makes sense once the device holds more than one slot
	const canReorder = device.slotKeys.length > 1;

	const deviceSinks = isSend ? device.slotKeys.map(k => sinks.get(k)).filter(Boolean) : [];
	const deviceSources = !isSend ? device.slotKeys.map(k => sources.get(k)).filter(Boolean) : [];
	// validate against every Send name, not just this device's, since the names share one space
	const allSinkNames = sinks.valueSeq().toArray().map(s => s.name);

	return (
		<Stack className={ classes.instanceWrap } onFocus={ onFieldFocusIn } onBlur={ onFieldFocusOut } style={ keyboardPad ? { paddingBottom: "60vh" } : undefined } >
			<Group justify="space-between" wrap="nowrap" >
				<div style={{ flex: "1 2 50%" }} >
					<DeviceSelectTitle
						currentValue={ linkDeviceValue(device.nodeId) }
						instances={ instances }
						linkDevices={ linkDevices }
						onChangeDevice={ onChangeDevice }
					/>
				</div>
				<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
					{
						isSend ? (
							<Button
								leftSection={ <IconElement path={ mdiPlus } /> }
								variant="default"
								onClick={ () => setAddSinkOpen(true) }
							>
								Add Send
							</Button>
						) : null
					}
					<Menu position="bottom-end" >
						<Menu.Target>
							<Tooltip label="Open Link Actions" >
								<ActionIcon variant="default" size="lg" >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Link Actions</Menu.Label>
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeleteDevice } >
								Delete Device
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Group>

			{
				isSend ? (
					<Stack gap="sm" >
						<Text size="xs" c="dimmed" >
							Channels announced to the Link session. Other peers subscribe to these by name.
						</Text>
						{
							!deviceSinks.length ? (
								<Alert color="blue" title="No Sends yet" >
									<Text size="sm" >Add one to announce a stereo channel to the Link session.</Text>
								</Alert>
							) : null
						}
						{
							deviceSinks.map((sink, i) => (
								<LinkAudioSinkRow
									key={ sink.id }
									sink={ sink }
									usedNames={ allSinkNames }
									first={ i === 0 }
									last={ i === deviceSinks.length - 1 }
									onMove={ canReorder ? onMoveSink : undefined }
								/>
							))
						}
					</Stack>
				) : (
					<Stack gap="sm" >
						<Text size="xs" c="dimmed" >
							Channels received from this peer. Add more from the Add Node menu in the graph editor.
						</Text>
						{
							deviceSources.map((source, i) => (
								<LinkAudioSourceRow
									key={ source.id }
									source={ source }
									first={ i === 0 }
									last={ i === deviceSources.length - 1 }
									onMove={ canReorder ? onMoveSource : undefined }
								/>
							))
						}
					</Stack>
				)
			}

			<AddSinkModal open={ addSinkOpen } usedNames={ allSinkNames } onClose={ () => setAddSinkOpen(false) } />
		</Stack>
	);
};
