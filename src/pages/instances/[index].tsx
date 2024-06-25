import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import InstanceComponent from "../../components/instance";
import { useRouter } from "next/router";
import { ActionIcon, Button, Group, NativeSelect, Stack, Text, Tooltip } from "@mantine/core";
import classes from "../../components/instance/instance.module.css";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus, SortOrder } from "../../lib/constants";
import Link from "next/link";
import { getInstanceByIndex, getInstances } from "../../selectors/instances";
import { unloadPatcherNodeByIndexOnRemote } from "../../actions/graph";
import { getAppSetting } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";
import PresetDrawer from "../../components/presets";
import { PresetRecord } from "../../models/preset";
import { destroyPresetOnRemoteInstance, renamePresetOnRemoteInstance, setInitialPresetOnRemoteInstance, loadPresetOnRemoteInstance, savePresetToRemoteInstance } from "../../actions/instances";
import { useDisclosure } from "@mantine/hooks";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import InstanceKeyboardModal from "../../components/keyroll/modal";
import { modals } from "@mantine/modals";
import { IconElement } from "../../components/elements/icon";
import { mdiCamera, mdiChartSankeyVariant, mdiPiano, mdiVectorSquare, mdiVectorSquareRemove } from "@mdi/js";

export default function Instance() {

	const { query, isReady, pathname, push } = useRouter();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();
	const [keyboardModalIsOpen, { close: closeKeyboardModal, toggle: toggleKeyboardModal }] = useDisclosure();

	const { index, ...restQuery } = query;
	const instanceIndex = parseInt(Array.isArray(index) ? index.join("") : index || "0", 10);

	const dispatch = useAppDispatch();

	const [
		currentInstance,
		appStatus,
		instances,
		datafiles,
		enabledMessageOuput,
		enabledMIDIKeyboard,
		sortAttr,
		sortOrder
	] = useAppSelector((state: RootStateType) => {
		const currentInstance = getInstanceByIndex(state, instanceIndex);

		return [
			currentInstance,
			getAppStatus(state),
			getInstances(state),
			getDataFilesSortedByName(state, SortOrder.Asc),
			getAppSetting(state, AppSetting.debugMessageOutput),
			getAppSetting(state, AppSetting.keyboardMIDIInput),
			getAppSetting(state, AppSetting.paramSortAttribute),
			getAppSetting(state, AppSetting.paramSortOrder)
		];
	});

	const onChangeInstance = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		push({ pathname, query: { ...query, index: e.currentTarget.value } });
	}, [push, pathname, query]);

	const onUnloadInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		modals.openConfirmModal({
			title: "Unload Patcher Instance",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to unload the Patcher Instance { currentInstance?.patcher } at index {currentInstance?.index}?
				</Text>
			),
			labels: { confirm: "Unload", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => {
				dispatch(unloadPatcherNodeByIndexOnRemote(currentInstance.index));
				push({ pathname: "/", query: restQuery });
			}
		});
	}, [dispatch, currentInstance, push, restQuery]);

	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadPresetOnRemoteInstance(currentInstance, preset));
	}, [dispatch, currentInstance]);

	const onSavePreset = useCallback((name: string) => {
		dispatch(savePresetToRemoteInstance(currentInstance, name));
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

	if (!currentInstance) {
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
						data={ instances.valueSeq().sortBy(n => n.index).toArray().map(d => ({ value: `${d.index}`, label: `${d.index}: ${d.patcher}` })) }
						leftSection={ <IconElement path={ mdiVectorSquare } /> }
						onChange={ onChangeInstance }
						value={ currentInstance.index }
						style={{ maxWidth: 300, width: "100%" }}
					/>
				</div>
				<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
					<Tooltip label="Unload Instance">
						<ActionIcon variant="outline" color="red" size="lg" onClick={ onUnloadInstance } >
							<IconElement path={ mdiVectorSquareRemove } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Open Virtual Keyboard">
						<ActionIcon variant="default" size="lg" onClick={ toggleKeyboardModal }>
							<IconElement path={ mdiPiano } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Open Preset Menu">
						<Button variant="default" leftSection={ <IconElement path={ mdiCamera } /> } onClick={ togglePresetDrawer } >
							Presets
						</Button>
					</Tooltip>
				</Group>
			</Group>
			<InstanceComponent
				instance={ currentInstance }
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
				onSavePreset={ onSavePreset }
				onRenamePreset={ onRenamePreset }
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
