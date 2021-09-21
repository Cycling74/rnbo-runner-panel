import React from "react";
import { useAppSelector } from "../hooks/useAppDispatch";
import { WebSocketState } from "../lib/constants";
import { getConnectionStatus } from "../selectors/network";

export default function Status({}) {

	const connectionState = useAppSelector(state => getConnectionStatus(state));
	const connectionString = connectionState !== WebSocketState.OPEN ? "not connected" : "connected";

	return <h2>You&apos;re {connectionString}</h2>
}
