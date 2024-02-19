import { Alert, Button, Group, Menu, MenuItemProps, Stack, Text } from "@mantine/core";
import { FunctionComponent, MouseEvent, forwardRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchers } from "../selectors/patchers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectGroup, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getConnections, getNodes } from "../selectors/graph";
import GraphEditor from "../components/editor";
import { Connection, Edge, EdgeChange, Node, NodeChange } from "reactflow";
import {
	applyEditorEdgeChanges, applyEditorNodeChanges, createEditorConnection,
	removeEditorConnectionsById, removeEditorNodesById,
	loadPatcherNodeOnRemote
} from "../actions/graph";
import SetsDrawer from "../components/sets";
import { toggleShowGraphSets } from "../actions/sets";

const NoPatcherInfo = forwardRef<HTMLDivElement, MenuItemProps>(function ForwardedNoPatcherInfo(props, ref) {
	return (
		<div { ...props } ref={ ref } style={{ maxWidth: "50vw", width: 200 }}>
			<Alert title="No Patch available" variant="outline" color="yellow">
				<Text fz="xs">
					Please export a RNBO patch to the runner first.
				</Text>
			</Alert>
		</div>
	);
});

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		nodes,
		connections
	] = useAppSelector((state: RootStateType) => [
		getPatchers(state),
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

	const onToggleSetsDrawer = useCallback(() => {
		dispatch(toggleShowGraphSets());
	}, [dispatch]);

	return (
		<>
			<Stack style={{ height: "100%" }} >
				<Group justify="flex-end">
					<Menu position="bottom-end">
						<Menu.Target>
							<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faPlus } /> } >
								Add Device
							</Button>
						</Menu.Target>
						<Menu.Dropdown>
							{
								patchers.size === 0 ? (
									<Menu.Item disabled component={ NoPatcherInfo } />
								) : <Menu.Label>Select Patcher</Menu.Label>
							}
							{
								patchers.valueSeq().toArray().map(p => (
									<Menu.Item key={ p.id } data-patcher-id={ p.id } onClick={ onAddInstance } >
										{ p.name }
									</Menu.Item>
								))
							}
						</Menu.Dropdown>
						<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faObjectGroup } /> } onClick={ onToggleSetsDrawer } >
							Sets
						</Button>
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
			<SetsDrawer />
		</>
	);
};

export default Index;
