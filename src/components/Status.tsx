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
	width: 7rem;

	h4 {
		margin: 0;
	}
`;
export default function Status({}) {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	const connectionString = connectionState !== WebSocketState.OPEN ? "not connected" : "connected";

	return (
	<StatusWrapper>
		<h4> You&apos;re {connectionString} </h4>
	</StatusWrapper>
	)
}
