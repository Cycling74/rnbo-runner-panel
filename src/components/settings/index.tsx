import { Button, Modal, Stack } from "@mantine/core";
import SettingsList from "./list";
import SettingsIntro from "./intro";
import AboutInfo from "../page/about";
import { FunctionComponent, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getShowSettingsModal } from "../../selectors/settings";
import { hideSettings } from "../../actions/settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { updateAudio } from "../../actions/config";

const Settings: FunctionComponent = memo(function WrappedSettings() {

	const showFullScreen = useIsMobileDevice();
	const doShowSettings = useAppSelector((state: RootStateType) => getShowSettingsModal(state));

	const dispatch = useAppDispatch();
	const onCloseModal = () => dispatch(hideSettings());
	const onAudioUpdate = () => dispatch(updateAudio());

	return (
		<Modal
			onClose={ onCloseModal }
			opened={ doShowSettings }
			fullScreen={ showFullScreen }
			size="xl"
			title="Settings"
		>
			<Stack gap="sm">
				<SettingsIntro />
				<SettingsList />
				<div>
					<Button variant="default" size="xs" onClick={ onAudioUpdate } leftSection={ <FontAwesomeIcon icon={ faRotateRight } /> } >
						Update Audio
					</Button>
				</div>
				<AboutInfo />
			</Stack>
		</Modal>
	);
});

export default Settings;
