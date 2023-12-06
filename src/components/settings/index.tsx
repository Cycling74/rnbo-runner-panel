import { Modal, Stack } from "@mantine/core";
import SettingsList from "./list";
import SettingsIntro from "./intro";
import AboutInfo from "../page/about";
import { FunctionComponent, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getShowSettingsModal } from "../../selectors/settings";
import { hideSettings } from "../../actions/settings";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";

const Settings: FunctionComponent = memo(function WrappedSettings() {

	const showFullScreen = useIsMobileDevice();
	const doShowSettings = useAppSelector((state: RootStateType) => getShowSettingsModal(state));

	const dispatch = useAppDispatch();
	const onCloseModal = () => dispatch(hideSettings());

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
				<AboutInfo />
			</Stack>
		</Modal>
	);
});

export default Settings;
