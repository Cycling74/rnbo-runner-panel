import { Button, Group, Menu, Stack } from "@mantine/core";
import React, { FunctionComponent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchers } from "../selectors/patchers";
import { addRemoteInstance } from "../actions/device";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getConnections, getNodes } from "../selectors/graph";
import { getEditorNodes } from "../selectors/editor";
import GraphEditor from "../components/editor";
import { Connection } from "reactflow";
import { makeEditorConnection } from "../actions/editor";

const Index: FunctionComponent<Record<string, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		patchers,
		graphNodes,
		editorNodes,
		connections
	] = useAppSelector((state: RootStateType) => [
		getPatchers(state),
		getNodes(state),
		getEditorNodes(state),
		getConnections(state)
	]);

	const onAddInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		const id = e.currentTarget.dataset.patcherId;
		if (!id) return;

		const patcher = patchers.get(id);
		if (!patcher) return;

		dispatch(addRemoteInstance(patcher));
	}, [dispatch, patchers]);

	const onConnectNodes = useCallback((connection: Connection) => {
		dispatch(makeEditorConnection(connection));
	}, [dispatch]);

	return (
		<Stack style={{ height: "100%" }} >
			<Group justify="flex-end">
				<Menu position="bottom-end">
					<Menu.Target>
						<Button variant="default" size="xs" leftSection={ <FontAwesomeIcon icon={ faPlus } /> } >
							Add Instance
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
				graphNodes={ graphNodes }
				editorNodes={ editorNodes }
				connections={ connections }
				onConnect={ onConnectNodes }
			/>
		</Stack>
	);
};

export default Index;
