import { ActionIcon, Button, Group, Menu, Stack } from "@mantine/core";
import { FunctionComponent, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getPatchers } from "../selectors/patchers";
import { addRemoteInstance } from "../actions/device";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getConnections, getPatcherNodes, getSystemNodes } from "../selectors/graph";
import { useRouter } from "next/router";

const Index: FunctionComponent<Record<string, never>> = () => {

	const { push, query } = useRouter();
	const dispatch = useAppDispatch();
	const [
		patchers,
		systemNodes,
		patcherNodes,
		connections
	] = useAppSelector((state: RootStateType) => [
		getPatchers(state),
		getSystemNodes(state),
		getPatcherNodes(state),
		getConnections(state)
	]);

	const onAddInstance = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		const patcher = patchers.get(e.currentTarget.dataset.patcherId);
		if (!patcher) return;
		dispatch(addRemoteInstance(patcher));
	}, [dispatch, patchers]);

	return (
		<Stack>
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
			<div>
				{
					systemNodes.valueSeq().map(node => {
						return (
							<div key={ node.id } >
								<strong>System Node &quot;{ node.name }&quot; (id: {node.id})</strong>
								<div>
									{
										connections.get(node.id)?.valueSeq().map(conn => {
											return (
												<div key={ conn.id } >
													<i>{ conn.sourcePortId }</i> to <i>{ conn.sinkPortId }</i> node <i>{ conn.sinkNodeId }</i>
												</div>
											);
										}) || "No Outgoing Connections"
									}
								</div>
							</div>
						);
					})
				}
				{
					patcherNodes.valueSeq().map(node => {
						return (
							<div key={ node.id } >
								<strong>Patcher Node &quot;{ node.name }&quot; (id: {node.id})</strong>
								<ActionIcon onClick={ () => push({ pathname: "/devices/[index]", query: { ...query, index: node.index }})} ><FontAwesomeIcon icon={ faEye } /></ActionIcon>
								<div>
									{
										connections.get(node.id)?.valueSeq().map(conn => {
											return (
												<div key={ conn.id } >
													<i>{ conn.sourcePortId }</i> to <i>{ conn.sinkPortId }</i> on node <i>{ conn.sinkNodeId }</i>
												</div>
											);
										}) || "No Outgoing Connections"
									}
								</div>
							</div>
						);
					})
				}
			</div>
			<div>

			</div>
		</Stack>
	);
};

export default Index;
