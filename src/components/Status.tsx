import React from "react";
import { useAppSelector } from "../hooks/useAppDispatch";
import { WebSocketState } from "../lib/constants";
import { getConnectionStatus } from "../selectors/network";
import styles from "../../styles/Device.module.css";

export default function Status({}) {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	const connectionString = connectionState !== WebSocketState.OPEN ? "not connected" : "connected";

	return (
	<div className={styles.status}>
		<h2>You&apos;re {connectionString}</h2>
	</div>
	)
}
