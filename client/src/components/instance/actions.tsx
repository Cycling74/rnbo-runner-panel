import { Button } from "@mantine/core";
import { FunctionComponent, memo } from "react";
import { IconElement } from "../elements/icon";
import { mdiTrashCan } from "@mdi/js";

const DeviceActions: FunctionComponent = memo(function WrapedDeviceActions() {
	return (
		<Button.Group>
			<Button variant="outline">
				<IconElement path={ mdiTrashCan } />
			</Button>

		</Button.Group>
	);
});

export default DeviceActions;
