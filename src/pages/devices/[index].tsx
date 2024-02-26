import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import DeviceInstance from "../../components/device";
import { useRouter } from "next/router";
import { Button, Group, NativeSelect, Stack } from "@mantine/core";
import classes from "../../components/device/device.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faDiagramProject, faTrash, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import Link from "next/link";
import { getDeviceByIndex, getDevices } from "../../selectors/instances";
import { unloadPatcherNodeByIndexOnRemote } from "../../actions/graph";
import { getAppSettingValue } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";
import DevicePresetDrawer from "../../components/presets";
import { PresetRecord } from "../../models/preset";
import { destroyPresetOnRemoteDeviceInstance, loadPresetOnRemoteDeviceInstance, savePresetToRemoteDeviceInstance } from "../../actions/instances";
import { useDisclosure } from "@mantine/hooks";

export default function Device() {

	const { query, isReady, pathname, push } = useRouter();
	const [presetDrawerIsOpen, { close: closePresetDrawer, toggle: togglePresetDrawer }] = useDisclosure();

	const { index, ...restQuery } = query;
	const deviceIndex = parseInt(Array.isArray(index) ? index.join("") : index || "0", 10);

	const dispatch = useAppDispatch();

	const [
		currentDevice,
		appStatus,
		devices,
		enabledMessageOuput
	] = useAppSelector((state: RootStateType) => {
		const currentDevice = getDeviceByIndex(state, deviceIndex);
		const enabledMessageOuput = getAppSettingValue<boolean>(state, AppSetting.debugMessageOutput);
		return [
			currentDevice,
			getAppStatus(state),
			getDevices(state),
			enabledMessageOuput
		];
	});

	const onChangeDevice = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		push({ pathname, query: { ...query, index: e.currentTarget.value } });
	}, [push, pathname, query]);

	const onUnloadDevice = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		dispatch(unloadPatcherNodeByIndexOnRemote(currentDevice.index));
		push({ pathname: "/", query: restQuery });
	}, [dispatch, currentDevice, push, restQuery]);

	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadPresetOnRemoteDeviceInstance(currentDevice, preset));
	}, [dispatch, currentDevice]);

	const onSavePreset = useCallback((name: string) => {
		dispatch(savePresetToRemoteDeviceInstance(currentDevice, name));
	}, [dispatch, currentDevice]);

	const onDeletePreset = useCallback((preset: PresetRecord) => {
		dispatch(destroyPresetOnRemoteDeviceInstance(currentDevice, preset));
	}, [dispatch, currentDevice]);

	if (!isReady || appStatus !== AppStatus.Ready) return null;

	if (!currentDevice) {
		// Device not found / doesn't exist
		return (
			<div className={ classes.deviceNotFound } >
				<h2>Device Not Found</h2>
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
		<Stack className={ classes.deviceInstanceWrap } >
			<Group justify="space-between" align="flex-end">
				<NativeSelect
					data={ devices.valueSeq().sortBy(n => n.index).toArray().map(d => ({ value: `${d.index}`, label: `${d.index}: ${d.patcher}` })) }
					leftSection={ <FontAwesomeIcon icon={ faVectorSquare } /> }
					onChange={ onChangeDevice }
					value={ currentDevice.index }
				/>
				<Group>
					<Button variant="outline" color="red" onClick={ onUnloadDevice } >
						<FontAwesomeIcon icon={ faTrash } />
					</Button>
					<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faCamera } /> } onClick={ togglePresetDrawer } >
						Presets
					</Button>
				</Group>
			</Group>
			<DeviceInstance
				device={ currentDevice }
				enabledMessageOuput={ enabledMessageOuput }
			/>
			<DevicePresetDrawer
				open={ presetDrawerIsOpen }
				onClose={ closePresetDrawer }
				onDeletePreset={ onDeletePreset }
				onLoadPreset={ onLoadPreset }
				onSavePreset={ onSavePreset }
				presets={ currentDevice.presets.valueSeq() }
			/>
		</Stack>
	);
}
