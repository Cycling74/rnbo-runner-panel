import { ActionIcon, Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { getRunnerEndpoint, getShowEndpointInfoModal } from "../../selectors/appStatus";
import { hideEndpointInfo } from "../../actions/appStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug, faXmark } from "@fortawesome/free-solid-svg-icons";

const EndpointInfo: FunctionComponent = memo(function WrappedSettings() {

	const dispatch = useAppDispatch();
	const [
		doShow,
		appEndpoint
	] = useAppSelector((state: RootStateType) => [
		getShowEndpointInfoModal(state),
		getRunnerEndpoint(state)
	]);

	const [{ hostname, port }, setEndpoint] = useState<{ hostname: string; port: string; }>({ ...appEndpoint });
	const showFullScreen = useIsMobileDevice();
	const formRef = useRef<HTMLFormElement>();

	const onCloseModal = useCallback(() => dispatch(hideEndpointInfo()), [dispatch]);

	const onReset = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		setEndpoint({ ...appEndpoint });
	}, [appEndpoint, setEndpoint]);

	const onChangeConfig = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setEndpoint({ hostname, port, [e.target.name]: e.target.value });
	}, [hostname, port, setEndpoint]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		window.location.href = `${window.location.protocol}//${window.location.host}?h=${encodeURIComponent(hostname)}&p=${encodeURIComponent(port)}`;
	}, [hostname, port]);

	useEffect(() => {
		if (!doShow) {
			setEndpoint({ ...appEndpoint });
		}
	}, [doShow, appEndpoint, setEndpoint]);

	const hasChanges = appEndpoint.hostname !== hostname || appEndpoint.port !== port;

	return (
		<Modal
			onClose={ onCloseModal }
			opened={ doShow }
			fullScreen={ showFullScreen }
			size="lg"
			title="OSCQuery Runner Endpoint"
		>
			<form onSubmit={ onSubmit } ref={ formRef } >
				<Stack gap="md">
					<TextInput
						onChange={ onChangeConfig }
						name="hostname"
						label="Hostname"
						description="The hostname or IP address of the device that runs the OSCQuery Runner"
						value={ hostname }
					/>
					<TextInput
						onChange={ onChangeConfig }
						name="port"
						label="Port"
						inputMode="numeric"
						pattern="[0-9]*"
						description="The port of the OSCQuery Runner Websocket"
						value={ port }
					/>
					<Group justify="flex-end">
						<Button.Group>
							<Button
								variant="light"
								color="gray"
								disabled={ !hasChanges }
								onClick={ onReset }
								leftSection={ <FontAwesomeIcon icon={ faXmark } /> }
							>
								Reset
							</Button>
							<Button
								type="submit"
								disabled={ !hasChanges }
								leftSection={ <FontAwesomeIcon icon={ faPlug } /> }
							>
								Connect
							</Button>
						</Button.Group>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
});

export default EndpointInfo;
