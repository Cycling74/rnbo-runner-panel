import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mantine/core";
import { FunctionComponent, memo } from "react";

const DeviceActions: FunctionComponent = memo(function WrapedDeviceActions() {
	return (
		<Button.Group>
			<Button variant="outline">
				<FontAwesomeIcon icon={ faTrash } />
			</Button>

		</Button.Group>
	);
});

export default DeviceActions;
