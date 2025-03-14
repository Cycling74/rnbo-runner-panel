import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import InstanceComponent from "../../components/instance";
import { useRouter } from "next/router";
import { Button, Group, NativeSelect, Stack } from "@mantine/core";
import classes from "../../components/instance/instance.module.css";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus, SortOrder } from "../../lib/constants";
import Link from "next/link";
import { getPatcherInstance, getPatcherInstanceParametersByInstanceId, getPatcherInstances, getPatcherInstanceMessageInportsByInstanceId, getPatcherInstanceMesssageOutportsByInstanceId } from "../../selectors/patchers";
import { unloadPatcherNodeOnRemote } from "../../actions/graph";
import { getAppSetting } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";
import PresetDrawer from "../../components/presets";
import { PresetRecord } from "../../models/preset";
import { destroyPresetOnRemoteInstance, renamePresetOnRemoteInstance, setInitialPresetOnRemoteInstance, loadPresetOnRemoteInstance, savePresetToRemoteInstance, onOverwritePresetOnRemoteInstance, createPresetOnRemoteInstance } from "../../actions/patchers";
import { useDisclosure } from "@mantine/hooks";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import InstanceKeyboardModal from "../../components/keyroll/modal";
import { IconElement } from "../../components/elements/icon";
import { mdiCamera, mdiChartSankeyVariant, mdiPiano, mdiVectorSquare, mdiVectorSquareRemove } from "@mdi/js";
import { ResponsiveButton } from "../../components/elements/responsiveButton";

const collator = new Intl.Collator("en-US", { numeric: true });

export default function Instance() {

	const { query, isReady, pathname, push } = useRouter();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();
	const [keyboardModalIsOpen, { close: closeKeyboardModal, toggle: toggleKeyboardModal }] = useDisclosure();

	const { id, ...restQuery } = query;
	const instanceId = Array.isArray(id) ? id.join("") : id || "0";

	const dispatch = useAppDispatch();

	const [
		currentInstance,
		parameters,
		messageInports,
		messageOutports,
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
			getAppStatus(state),
			getPatcherInstances(state),
			getDataFilesSortedByName(state, SortOrder.Asc),
			getAppSetting(state, AppSetting.debugMessageOutput),
			getAppSetting(state, AppSetting.keyboardMIDIInput),
			getAppSetting(state, AppSetting.paramSortAttribute),
			getAppSetting(state, AppSetting.paramSortOrder)
		];
	});

	const onChangeInstance = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		push({ pathname, query: { ...query, id: e.currentTarget.value } });
	}, [push, pathname, query]);

	const onUnloadInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		dispatch(unloadPatcherNodeOnRemote(currentInstance.id));
	}, [dispatch, currentInstance, push, restQuery]);

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

	if (!isReady || appStatus !== AppStatus.Ready) return null;

	if (!currentInstance || !parameters || !messageInports || !messageOutports) {
		// Instance not found / doesn't exist
		return (
			<div className={ classes.instanceNotFound } >
				<h2>Instance Not Found</h2>
				<Button
					component={ Link }
					href={{ pathname: "/", query: restQuery }}
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
					<NativeSelect
						data={ instances.valueSeq().sort((a, b) => collator.compare(a.id, b.id)).toArray().map(d => ({ value: d.id, label: d.displayName })) }
						leftSection={ <IconElement path={ mdiVectorSquare } /> }
						onChange={ onChangeInstance }
						value={ currentInstance.id }
						style={{ maxWidth: 300, width: "100%" }}
					/>
				</div>
				<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
					<ResponsiveButton
						label="Delete"
						tooltip="Delete Device"
						icon={ mdiVectorSquareRemove }
						onClick={ onUnloadInstance }
						variant="outline"
						color="red"
					/>
					<ResponsiveButton
						label="Keyboard"
						tooltip="Open Virtual Keyboard"
						icon={ mdiPiano }
						onClick={ toggleKeyboardModal }
					/>
					<ResponsiveButton
						label="Presets"
						tooltip="Open Device Preset Menu"
						icon={ mdiCamera }
						onClick={ togglePresetDrawer }
					/>
				</Group>
			</Group>
			<InstanceComponent
				instance={ currentInstance }
				parameters={ parameters }
				messageInports={ messageInports }
				messageOutports={ messageOutports }
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
}
