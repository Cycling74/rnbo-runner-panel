import React from "react";
import { useAppSelector } from "../hooks/useAppDispatch";
import { WebSocketState } from "../lib/constants";
import { getConnectionStatus } from "../selectors/network";
import styles from "../../styles/Device.module.css";
import styled from "styled-components";

const StatusWrapper = styled.div`
	font-size: 0.5rem;
	color: yellow;
	border-radius: 2rem;
	padding: 0.25rem 0.75rem;
	border: 2px solid yellow;
`;
export default function Status({}) {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	const connectionString = connectionState !== WebSocketState.OPEN ? "not connected" : "connected";

	return (
	<StatusWrapper>
		<h2>You&apos;re {connectionString}</h2>
	</StatusWrapper>
	)
}
