import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import DeviceInstance from "../../components/device";
import { useRouter } from "next/router";
import { Button, Group, NativeSelect, Stack } from "@mantine/core";
import classes from "../../components/device/device.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiagramProject, faTrash, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { getSetting } from "../../selectors/settings";
import { Setting } from "../../reducers/settings";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import Link from "next/link";
import { getDeviceByIndex, getDevices } from "../../selectors/instances";
import { unloadPatcherNodeByIndexOnRemote } from "../../actions/graph";

export default function Device() {

	const { query, isReady, pathname, push } = useRouter();

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
		const enabledMessageOuput = getSetting<boolean>(state, Setting.debugMessageOutput);
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
				<Button variant="outline" color="red" onClick={ onUnloadDevice } >
					<FontAwesomeIcon icon={ faTrash } />
				</Button>
			</Group>
			<DeviceInstance
				device={ currentDevice }
				enabledMessageOuput={ enabledMessageOuput }
			/>
		</Stack>
	);
}
