import { Modal, Stack, TextInput } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { getRunnerEndpoint, getShowEndpointInfoModal } from "../../selectors/appStatus";
import { hideEndpointInfo } from "../../actions/appStatus";

const EndpointInfo: FunctionComponent = memo(function WrappedSettings() {

	const showFullScreen = useIsMobileDevice();

	const dispatch = useAppDispatch();
	const onCloseModal = useCallback(() => dispatch(hideEndpointInfo()), [dispatch]);
	const [
		doShow,
		{ hostname, port }
	] = useAppSelector((state: RootStateType) => [
		getShowEndpointInfoModal(state),
		getRunnerEndpoint(state)
	]);

	return (
		<Modal
			onClose={ onCloseModal }
			opened={ doShow }
			fullScreen={ showFullScreen }
			size="md"
			title="OSCQuery Runner Endpoint"
		>
			<Stack gap="sm">
				<TextInput
					readOnly
					label="Hostname"
					description="The hostname or IP address of the device that runs the OSCQuery Runner"
					value={ hostname }
				/>
				<TextInput
					readOnly
					label="Port"
					description="The port of the OSCQuery Runner Websocket"
					value={ port }
				/>
			</Stack>
		</Modal>
	);
});

export default EndpointInfo;
