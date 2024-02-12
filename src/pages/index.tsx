import { Button, Group, Menu, Stack } from "@mantine/core";
import React, { FunctionComponent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchers } from "../selectors/patchers";
import { getSets } from "../selectors/sets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getConnections, getNodes } from "../selectors/graph";
import GraphEditor from "../components/editor";
import { Connection, Edge, EdgeChange, Node, NodeChange } from "reactflow";
import {
	applyEditorEdgeChanges, applyEditorNodeChanges, createEditorConnection,
	removeEditorConnectionsById, removeEditorNodesById,
	loadPatcherNodeOnRemote,
	loadSetOnRemote, saveSetOnRemote
} from "../actions/graph";
import SetControl from "../components/editor/sets";
import { SetRecord } from "../models/set";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		sets,
		nodes,
		connections
	] = useAppSelector((state: RootStateType) => [
		getPatchers(state),
		getSets(state),
		getNodes(state),
		getConnections(state)
	]);

	const onAddInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		const id = e.currentTarget.dataset.patcherId;
		if (!id) return;

		const patcher = patchers.get(id);
		if (!patcher) return;

		dispatch(loadPatcherNodeOnRemote(patcher));
	}, [dispatch, patchers]);

	const onConnectNodes = useCallback((connection: Connection) => {
		dispatch(createEditorConnection(connection));
	}, [dispatch]);

	const onNodesChange = useCallback((changes: NodeChange[]) => {
		dispatch(applyEditorNodeChanges(changes));
	}, [dispatch]);

	const onNodesDelete = useCallback((nodes: Pick<Node, "id">[]) => {
		dispatch(removeEditorNodesById(nodes.map(n => n.id)));
	}, [dispatch]);

	const onEdgesChange = useCallback((changes: EdgeChange[]) => {
		dispatch(applyEditorEdgeChanges(changes));
	}, [dispatch]);

	const onEdgesDelete = useCallback((edges: Pick<Edge, "id">[]) => {
		dispatch(removeEditorConnectionsById(edges.map(e => e.id)));
	}, [dispatch]);

	const onLoadSet = useCallback((set: SetRecord) => {
		dispatch(loadSetOnRemote(set));
	}, [dispatch]);

	const onSaveSet = useCallback((name: string) => {
		dispatch(saveSetOnRemote(name));
	}, [dispatch]);

	return (
		<Stack style={{ height: "100%" }} >
			<Group justify="flex-end">
				<SetControl
					sets={ sets }
					onLoadSet={ onLoadSet }
					onSaveSet={ onSaveSet }
				/>
				<Menu position="bottom-end">
					<Menu.Target>
						<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faPlus } /> } >
							Add Device
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Select Patcher</Menu.Label>
						{
							patchers.valueSeq().toArray().map(p => (
								<Menu.Item key={ p.id } data-patcher-id={ p.id } onClick={ onAddInstance } >
									{ p.name }
								</Menu.Item>
							))
						}
					</Menu.Dropdown>
				</Menu>
			</Group>
			<GraphEditor
				nodes={ nodes }
				connections={ connections }
				onConnect={ onConnectNodes }
				onNodesChange={ onNodesChange }
				onNodesDelete={ onNodesDelete }
				onEdgesChange={ onEdgesChange }
				onEdgesDelete={ onEdgesDelete }
			/>
		</Stack>
	);
};

export default Index;
