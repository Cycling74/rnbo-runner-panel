import { FC, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import InstanceComponent from "../components/instance";
import { ActionIcon, Button, Group, Menu, Stack, Tooltip } from "@mantine/core";
import classes from "../components/instance/instance.module.css";
import { getAppStatus } from "../selectors/appStatus";
import { AppStatus, SortOrder } from "../lib/constants";
import { getPatcherInstance, getPatcherInstanceParametersByInstanceId, getPatcherInstances, getPatcherInstanceMessageInportsByInstanceId, getPatcherInstanceMesssageOutportsByInstanceId, getPatcherInstanceDataRefsByInstanceId } from "../selectors/patchers";
import { unloadPatcherNodeOnRemote } from "../actions/graph";
import { getAppSetting } from "../selectors/settings";
import { AppSetting } from "../models/settings";
import PresetDrawer from "../components/presets";
import { PresetRecord } from "../models/preset";
import { destroyPresetOnRemoteInstance, renamePresetOnRemoteInstance, setInitialPresetOnRemoteInstance, loadPresetOnRemoteInstance, onOverwritePresetOnRemoteInstance, createPresetOnRemoteInstance, changeAliasOnRemoteInstance } from "../actions/patchers";
import { useDisclosure } from "@mantine/hooks";
import { getDataFilesSortedByName } from "../selectors/datafiles";
import InstanceKeyboardModal from "../components/keyroll/modal";
import { IconElement } from "../components/elements/icon";
import { mdiCamera, mdiChartSankeyVariant, mdiDotsVertical, mdiPencil, mdiPiano, mdiTrashCan } from "@mdi/js";
import { InstanceSelectTitle } from "../components/instance/title";
import { PatcherInstanceRecord } from "../models/instance";
import { Link, useLocation, useNavigate, useParams } from "react-router";

export const InstancePage: FC<Record<never, never>> = () => {

	const { search } = useLocation();
	const navigate = useNavigate();
	const { id } = useParams();

	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();
	const [keyboardModalIsOpen, { close: closeKeyboardModal, toggle: toggleKeyboardModal }] = useDisclosure();


	const instanceId = Array.isArray(id) ? id.join("") : id || "0";

	const dispatch = useAppDispatch();

	const [
		currentInstance,
		parameters,
		messageInports,
		messageOutports,
		dataRefs,
		appStatus,
		instances,
		datafiles,
		enabledMessageOuput,
		enabledMIDIKeyboard,
		sortAttr,
		sortOrder
	] = useAppSelector((state: RootStateType) => {
		const currentInstance = getPatcherInstance(state, instanceId);
		return [
			currentInstance,
			currentInstance ? getPatcherInstanceParametersByInstanceId(state, currentInstance.id) : undefined,
			currentInstance ? getPatcherInstanceMessageInportsByInstanceId(state, currentInstance.id) : undefined,
			currentInstance ? getPatcherInstanceMesssageOutportsByInstanceId(state, currentInstance.id) : undefined,
			currentInstance ? getPatcherInstanceDataRefsByInstanceId(state, currentInstance.id) : undefined,
			getAppStatus(state),
			getPatcherInstances(state),
			getDataFilesSortedByName(state, SortOrder.Asc),
			getAppSetting(state, AppSetting.debugMessageOutput),
			getAppSetting(state, AppSetting.keyboardMIDIInput),
			getAppSetting(state, AppSetting.paramSortAttribute),
			getAppSetting(state, AppSetting.paramSortOrder)
		];
	});

	const onChangeInstance = useCallback((instance: PatcherInstanceRecord) => {
		navigate({ pathname: `/instances/${encodeURIComponent(instance.id)}`, search });
	}, [navigate, search]);

	const onUnloadInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		dispatch(unloadPatcherNodeOnRemote(currentInstance.id));
	}, [dispatch, currentInstance]);

	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadPresetOnRemoteInstance(currentInstance, preset));
	}, [dispatch, currentInstance]);

	const onCreatePreset = useCallback(() => {
		dispatch(createPresetOnRemoteInstance(currentInstance));
	}, [dispatch, currentInstance]);

	const onOverwritePreset = useCallback((preset: PresetRecord) => {
		dispatch(onOverwritePresetOnRemoteInstance(currentInstance, preset));
	}, [dispatch, currentInstance]);

	const onDeletePreset = useCallback((preset: PresetRecord) => {
		dispatch(destroyPresetOnRemoteInstance(currentInstance, preset));
	}, [dispatch, currentInstance]);

	const onRenamePreset = useCallback((preset: PresetRecord, name: string) => {
		dispatch(renamePresetOnRemoteInstance(currentInstance, preset, name));
	}, [dispatch, currentInstance]);

	const onSetInitialPreset = useCallback((preset: PresetRecord) => {
		dispatch(setInitialPresetOnRemoteInstance(currentInstance, preset));
	}, [dispatch, currentInstance]);

	const onTriggerRenameInstance = useCallback(() => {
		dispatch(changeAliasOnRemoteInstance(currentInstance));
	}, [dispatch, currentInstance]);

	if (appStatus !== AppStatus.Ready) return null;

	if (!currentInstance || !parameters || !messageInports || !messageOutports) {
		// Instance not found / doesn't exist
		return (
			<div className={ classes.instanceNotFound } >
				<h2>Instance Not Found</h2>
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

	return (
		<Stack className={ classes.instanceWrap } >
			<Group justify="space-between" wrap="nowrap">
				<div style={{ flex: "1 2 50%" }} >
					<InstanceSelectTitle
						currentInstanceId={ currentInstance.id }
						instances={ instances }
						onChangeInstance={ onChangeInstance }
					/>
				</div>
				<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
					<Tooltip label="Open Device Preset Menu">
						<ActionIcon size="lg" variant="default" onClick={ togglePresetDrawer } >
							<IconElement path={ mdiCamera } />
						</ActionIcon>
					</Tooltip>
					<Menu position="bottom-end">
						<Menu.Target>
							<Tooltip label="Open Device Menu">
								<ActionIcon variant="default" size="lg">
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Device</Menu.Label>
							<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ onTriggerRenameInstance } >
								Rename
							</Menu.Item>
							<Menu.Item leftSection={ <IconElement path={ mdiPiano } /> } onClick={ toggleKeyboardModal } >
								Virtual Keyboard
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onUnloadInstance } color="red" >
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Group>
			<InstanceComponent
				instance={ currentInstance }
				parameters={ parameters }
				messageInports={ messageInports }
				messageOutports={ messageOutports }
				dataRefs={ dataRefs }
				datafiles={ datafiles }
				enabledMessageOuput={ enabledMessageOuput }
				paramSortAttr={ sortAttr }
				paramSortOrder={ sortOrder }
			/>
			<PresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onCreatePreset={ onCreatePreset }
				onRenamePreset={ onRenamePreset }
				onOverwritePreset={ onOverwritePreset }
				onSetInitialPreset={ onSetInitialPreset }
				presets={ currentInstance.presets.valueSeq() }
			/>
			<InstanceKeyboardModal
				open={ keyboardModalIsOpen }
				onClose={ closeKeyboardModal }
				instance={ currentInstance }
				keyboardEnabled= { enabledMIDIKeyboard.value as boolean }
			/>
		</Stack>
	);
};
