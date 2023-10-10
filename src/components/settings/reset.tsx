import { Button } from "@mantine/core";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { resetSettingsToDefault } from "../../actions/settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

const ResetSettingsButton = () => {

	const dispatch = useAppDispatch();
	const onReset = () => dispatch(resetSettingsToDefault());

	return (
		<Button variant="default" onClick={ onReset } leftSection={ <FontAwesomeIcon icon={ faRotateRight } /> } >
			Reset
		</Button>
	);
};

export default ResetSettingsButton;
