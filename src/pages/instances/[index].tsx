import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import InstanceComponent from "../../components/instance";
import { useRouter } from "next/router";
import { Button, Group, NativeSelect, Stack } from "@mantine/core";
import classes from "../../components/instance/instance.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faDiagramProject, faTrash, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import Link from "next/link";
import { getInstanceByIndex, getInstances } from "../../selectors/instances";
import { unloadPatcherNodeByIndexOnRemote } from "../../actions/graph";
import { getAppSettingValue } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";
import InstancePresetDrawer from "../../components/presets";
import { PresetRecord } from "../../models/preset";
import { destroyPresetOnRemoteInstance, loadPresetOnRemoteInstance, savePresetToRemoteInstance } from "../../actions/instances";
import { useDisclosure } from "@mantine/hooks";

export default function Instance() {

	const { query, isReady, pathname, push } = useRouter();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();

	const { index, ...restQuery } = query;
	const instanceIndex = parseInt(Array.isArray(index) ? index.join("") : index || "0", 10);

	const dispatch = useAppDispatch();

	const [
		currentInstance,
		appStatus,
		instances,
		enabledMessageOuput,
		enabledMIDIKeyboard
	] = useAppSelector((state: RootStateType) => {
		const currentInstance = getInstanceByIndex(state, instanceIndex);
		return [
			currentInstance,
			getAppStatus(state),
			getInstances(state),
			getAppSettingValue<boolean>(state, AppSetting.debugMessageOutput),
			getAppSettingValue<boolean>(state, AppSetting.keyboardMIDIInput)
		];
	});

	const onChangeInstance = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		push({ pathname, query: { ...query, index: e.currentTarget.value } });
	}, [push, pathname, query]);

	const onUnloadInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		dispatch(unloadPatcherNodeByIndexOnRemote(currentInstance.index));
		push({ pathname: "/", query: restQuery });
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

	if (!isReady || appStatus !== AppStatus.Ready) return null;

	if (!currentInstance) {
		// Instance not found / doesn't exist
		return (
			<div className={ classes.instanceNotFound } >
				<h2>Instance Not Found</h2>
				<Button
					component={ Link }
					href={{ pathname: "/", query: restQuery }}
					leftSection={ <FontAwesomeIcon icon={ faDiagramProject } /> }
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
			<Group justify="space-between" align="flex-end">
				<NativeSelect
					data={ instances.valueSeq().sortBy(n => n.index).toArray().map(d => ({ value: `${d.index}`, label: `${d.index}: ${d.patcher}` })) }
					leftSection={ <FontAwesomeIcon icon={ faVectorSquare } /> }
					onChange={ onChangeInstance }
					value={ currentInstance.index }
				/>
				<Group>
					<Button variant="outline" color="red" onClick={ onUnloadInstance } >
						<FontAwesomeIcon icon={ faTrash } />
					</Button>
					<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faCamera } /> } onClick={ togglePresetDrawer } >
						Presets
					</Button>
				</Group>
			</Group>
			<InstanceComponent
				instance={ currentInstance }
				enabledMessageOuput={ enabledMessageOuput }
				enabledMIDIKeyboard={ enabledMIDIKeyboard }
			/>
			<InstancePresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onSavePreset={ onSavePreset }
				presets={ currentInstance.presets.valueSeq() }
			/>
		</Stack>
	);
}
