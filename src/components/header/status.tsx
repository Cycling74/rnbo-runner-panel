import React from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { WebSocketState } from "../../lib/constants";
import { getConnectionStatus } from "../../selectors/network";
import styled from "styled-components";

interface StatusProps {
	connected: boolean;
}

const StatusWrapper = styled.div<StatusProps>`
	font-size: 0.8rem;
	color: ${({ theme, connected }) => connected ? theme.colors.success : theme.colors.primary};
	border: 2px solid ${({ theme, connected }) => connected ? theme.colors.success : theme.colors.primary};
	border-radius: 2rem;
	padding: 0.5rem 1rem;
	text-align: center;
	height: 1rem;

	h4 {
		margin: 0;
	}

	@media (max-width: 769px) {
		position: absolute;
		top: 8px;
		right: 8px;
	}
`;

export default function Status() {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	let connectionString: string;
	switch (connectionState) {
		case WebSocketState.CONNECTING:
			connectionString = "Connecting";
			break;
		case WebSocketState.OPEN:
			connectionString = "Connected";
			break;
		case WebSocketState.CLOSING:
			connectionString = "Disconnecting";
			break;
		case WebSocketState.CLOSED:
			connectionString = "Disconnected";
			break;
		default: {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const c: never = connectionState;
		}
	}

	return (
		<StatusWrapper connected={connectionState === WebSocketState.OPEN}>
			<h4>{ connectionString } </h4>
		</StatusWrapper>
	);
}
