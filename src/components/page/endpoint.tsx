import { Alert, Anchor, Button, Fieldset, Group, Modal, Skeleton, Stack, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { getAppStatus, getRunnerInfoRecord, getRunnerEndpoint, getShowEndpointInfoModal } from "../../selectors/appStatus";
import { hideEndpointInfo } from "../../actions/appStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug, faXmark } from "@fortawesome/free-solid-svg-icons";
import { AppStatus } from "../../lib/constants";
import { showSettings } from "../../actions/settings";
import { RunnerInfoKey } from "../../models/runnerInfo";

const EndpointInfo: FunctionComponent = memo(function WrappedSettings() {

	const dispatch = useAppDispatch();
	const [
		doShow,
		appEndpoint,
		appStatus,
		xrunInfo,
		runnerVersion
	] = useAppSelector((state: RootStateType) => [
		getShowEndpointInfoModal(state),
		getRunnerEndpoint(state),
		getAppStatus(state),
		getRunnerInfoRecord(state, RunnerInfoKey.XRunCount),
		getRunnerInfoRecord(state, RunnerInfoKey.RunnerVersion)?.oscValue || "unknown"
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

	const openSettings = useCallback(() => {
		dispatch(hideEndpointInfo());
		dispatch(showSettings());
	}, [dispatch]);

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
			title="OSCQuery Runner Info"
		>
			<Stack gap="xl">
				<form onSubmit={ onSubmit } ref={ formRef } >
					<Fieldset legend="Connection Endpoint">
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
					</Fieldset>
				</form>
				<Fieldset legend="Runner Version">
					{
						runnerVersion
					}
				</Fieldset>
				<Fieldset legend="Status">
					{
						appStatus === AppStatus.AudioOff ? (
							<Alert variant="light" color="yellow" title="Audio is Off">
								Go to <Anchor inherit onClick={ openSettings } >Settings</Anchor> to update audio configuration.
							</Alert>
						) : null
					}
					{
						appStatus === AppStatus.Ready && xrunInfo ? (
							<TextInput
								label="xrun count"
								description={ xrunInfo.description  }
								readOnly
								value={ `${xrunInfo.oscValue}` }
							/>
						) : (
							<Skeleton height={ 30 } />
						)
					}
				</Fieldset>
			</Stack>
		</Modal>
	);
});

export default EndpointInfo;
