import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getNodeByIndex, getPatcherNodes } from "../../selectors/graph";
import DeviceInstance from "../../components/device";
import { useRouter } from "next/router";
import { Button, Group, NativeSelect, Stack } from "@mantine/core";
import classes from "../../components/device/device.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { unloadPatcherFromRemoteInstance } from "../../actions/device";
import { getSetting } from "../../selectors/settings";
import { Setting } from "../../reducers/settings";

export default function Device() {

	const { query, isReady, pathname, push } = useRouter();

	const { index, ...restQuery } = query;
	const deviceIndex = parseInt(Array.isArray(index) ? index.join("") : index || "0", 10);

	const dispatch = useAppDispatch();
	const [
		currentDevice,
		devices,
		enabledMessageOuput
	] = useAppSelector((state: RootStateType) => [
		getNodeByIndex(state, deviceIndex),
		getPatcherNodes(state),
		getSetting(state, Setting.debugMessageOutput)
	]);

	const onChangeDevice = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		push({ pathname, query: { ...query, index: e.currentTarget.value } });
	}, [push, pathname, query]);

	const onUnloadDevice = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		dispatch(unloadPatcherFromRemoteInstance(currentDevice));
		push({ pathname: "/", query: restQuery });
	}, [dispatch, currentDevice, push, restQuery]);

	if (!isReady || !currentDevice) return null;

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
			<DeviceInstance device={ currentDevice } enabledMessageOuput={ enabledMessageOuput } />
		</Stack>
	);
}
