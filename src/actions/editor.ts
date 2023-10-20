import { Connection } from "reactflow";
import { AppThunk } from "../lib/store";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { isValidConnection } from "../lib/editorUtils";
import { getConnectionByNodesAndPorts } from "../selectors/graph";


export const makeEditorConnection = (connection: Connection): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
				throw new Error(`Invalid Connection Description (${connection.source}:${connection.sourceHandle} => ${connection.target}:${connection.targetHandle})`);
			}

			// Valid Connection?
			isValidConnection(connection, state.graph.nodes);

			// Does it already exist?
			const existingConnection = getConnectionByNodesAndPorts(
				state,
				{
					sourceNodeId: connection.source,
					sinkNodeId: connection.target,
					sourcePortName: connection.sourceHandle,
					sinkPortName: connection.targetHandle
				}
			);

			if (existingConnection) {
				return void dispatch(showNotification({
					title: "Skipped creating connection",
					level: NotificationLevel.warn,
					message: `A connection between ${connection.source}:${connection.sourceHandle} and ${connection.target}:${connection.targetHandle} already exists`
				}));
			}

			dispatch(showNotification({
				title: "TODO",
				level: NotificationLevel.success,
				message: `Connect ${connection.source}:${connection.sourceHandle} to ${connection.target}:${connection.targetHandle}`
			}));

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to create connection",
				level: NotificationLevel.error,
				message: err.message
			}));
		}
	};
