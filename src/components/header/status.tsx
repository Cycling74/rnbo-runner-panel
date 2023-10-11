import React from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { WebSocketState } from "../../lib/constants";
import { getConnectionStatus } from "../../selectors/network";
import { Indicator, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCircleNotch, faPlugCircleCheck, faPlugCircleExclamation, faPlugCircleXmark } from "@fortawesome/free-solid-svg-icons";

export default function Status() {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	let icon: IconDefinition;
	let label: string;
	let color: string;
	switch (connectionState) {
		case WebSocketState.CONNECTING:
			label = "Connecting...";
			color = "yellow";
			icon = faCircleNotch;
			break;
		case WebSocketState.OPEN:
			label = "Connected";
			color = "green";
			icon = faPlugCircleCheck;
			break;
		case WebSocketState.CLOSING:
			label = "Disconnectiong";
			color = "yellow";
			icon = faPlugCircleExclamation;
			break;
		case WebSocketState.CLOSED:
			label = "Disconnected";
			color = "red";
			icon = faPlugCircleXmark;
			break;
		default: {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const c: never = connectionState;
		}
	}

	return (
		<Tooltip label={ label } >
			<Indicator color={ color } >
				<FontAwesomeIcon icon={ icon } spin={ icon === faCircleNotch } fixedWidth/>
			</Indicator>
		</Tooltip>
	);
}
