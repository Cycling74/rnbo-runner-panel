import React from "react";
import { useAppSelector } from "../hooks/useAppDispatch";
import { WebSocketState } from "../lib/constants";
import { getConnectionStatus } from "../selectors/network";
import styled from "styled-components";

const StatusWrapper = styled.div`
	font-size: 0.8rem;
	color: ${props => props.theme.colors.primary};
	border-radius: 2rem;
	padding: 0.5rem;
	text-align: center;
	border: 2px solid ${props => props.theme.colors.primary};
	height: 1rem;
	min-width: 7rem;

	h4 {
		margin: 0;
	}
	@media screen and (max-width: 35.5em) {
		color: ${props => props.theme.colors.secondary};
		border: 2px solid ${props => props.theme.colors.secondary};
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
		<StatusWrapper>
			<h4>{ connectionString } </h4>
		</StatusWrapper>
	);
}
