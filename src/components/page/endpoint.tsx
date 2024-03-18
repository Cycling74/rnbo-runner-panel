import { ActionIcon, Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { getRunnerEndpoint, getShowEndpointInfoModal } from "../../selectors/appStatus";
import { hideEndpointInfo } from "../../actions/appStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlug, faXmark } from "@fortawesome/free-solid-svg-icons";

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
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const showFullScreen = useIsMobileDevice();
	const formRef = useRef<HTMLFormElement>();

	const onCloseModal = useCallback(() => dispatch(hideEndpointInfo()), [dispatch]);
	const selectInput = useCallback((name: string) => {
		if (!formRef.current) return;
		const el = formRef.current.querySelector<HTMLInputElement>(`input[name="${name}"]`);
		el?.select();
	}, [formRef]);

	const onToggleEdit = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		if (isEditing) {
			// Reset Values
			setEndpoint({ ...appEndpoint });
		}
		setIsEditing(!isEditing);
		selectInput(e.currentTarget.name);
	}, [appEndpoint, isEditing, setIsEditing, selectInput]);

	const onEnableEdit = useCallback((e: MouseEvent<HTMLInputElement>) => {
		if (isEditing) return;
		setIsEditing(true);
		selectInput(e.currentTarget.name);
	}, [isEditing, setIsEditing, selectInput]);


	const onChangeConfig = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setEndpoint({ hostname, port, [e.target.name]: e.target.value });
	}, [hostname, port, setEndpoint]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isEditing) return;
		window.location.href = `${window.location.protocol}//${window.location.host}?h=${encodeURIComponent(hostname)}&p=${encodeURIComponent(port)}`;
	}, [isEditing, hostname, port]);

	useEffect(() => {
		if (!doShow && isEditing) {
			setIsEditing(false);
			setEndpoint({ ...appEndpoint });
		}
	}, [doShow, isEditing, appEndpoint, setEndpoint]);

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
						readOnly={ !isEditing }
						onChange={ onChangeConfig }
						name="hostname"
						label="Hostname"
						description="The hostname or IP address of the device that runs the OSCQuery Runner"
						value={ hostname }
						onDoubleClick={ onEnableEdit }
						rightSection={ isEditing ? null : <ActionIcon name="hostname" variant="subtle" color="gray" onClick={ onToggleEdit }><FontAwesomeIcon icon={ faPencil } /></ActionIcon> }
					/>
					<TextInput
						readOnly={ !isEditing }
						onChange={ onChangeConfig }
						name="port"
						label="Port"
						inputMode="numeric"
						pattern="[0-9]*"
						description="The port of the OSCQuery Runner Websocket"
						value={ port }
						onDoubleClick={ onEnableEdit }
						rightSection={ isEditing ? null : <ActionIcon name="port" variant="subtle" color="gray" onClick={ onToggleEdit }><FontAwesomeIcon icon={ faPencil } /></ActionIcon> }
					/>
					<Group justify="flex-end">
						{
							isEditing ? (
								<Button.Group>
									<Button variant="light" color="gray" onClick={ onToggleEdit } leftSection={ <FontAwesomeIcon icon={ faXmark } /> } >Cancel</Button>
									<Button type="submit" leftSection={ <FontAwesomeIcon icon={ faPlug } /> } >Connect</Button>
								</Button.Group>
							) : null
						}
					</Group>
				</Stack>
			</form>
		</Modal>
	);
});

export default EndpointInfo;
