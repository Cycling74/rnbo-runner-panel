import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getGraphSetViewsBySortOrder, getSelectedGraphSetView } from "../selectors/sets";
import { useCallback } from "react";
import { ResponsiveButton } from "../components/elements/responsiveButton";
import { Group, Stack, Title } from "@mantine/core";
import { mdiKnob } from "@mdi/js";
import { useDisclosure } from "@mantine/hooks";
import { createSetViewOnRemote, destroySetViewOnRemote, loadSetView, decreaseParameterIndexInSetView, increaseParameterIndexInSetView, removeParameterFromSetView, renameSetViewOnRemote } from "../actions/sets";
import SetViewDrawer from "../components/setViews/drawer";
import { GraphSetViewRecord } from "../models/set";
import { getPatcherInstanceParametersBySetView } from "../selectors/patchers";
import { SetViewParameterList } from "../components/setViews/parameterList";
import { ParameterRecord } from "../models/parameter";
import { setInstanceParameterValueNormalizedOnRemote } from "../actions/patchers";

export default function SetViews() {

	const [setViewDrawerOpen, { open: openSetViewDrawer, close: closeSetViewDrawer }] = useDisclosure();
	const dispatch = useAppDispatch();

	const [
		currentSetView,
		currentSetViewParameters,
		setViews
	] = useAppSelector((state: RootStateType) => {
		const current = getSelectedGraphSetView(state);
		return [
			current,
			current ? getPatcherInstanceParametersBySetView(state, current) : undefined,
			getGraphSetViewsBySortOrder(state)
		];
	});

	const onCreateSetView = useCallback((name: string) => {
		dispatch(createSetViewOnRemote(name));
	}, [dispatch]);

	const onLoadSetView = useCallback((view: GraphSetViewRecord) => {
		dispatch(loadSetView(view));
	}, [dispatch]);

	const onDeleteSetView = useCallback((view: GraphSetViewRecord) => {
		dispatch(destroySetViewOnRemote(view));
	}, [dispatch]);

	const onRenameSetView = useCallback((view: GraphSetViewRecord, name: string) => {
		dispatch(renameSetViewOnRemote(view, name));
	}, [dispatch]);

	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setInstanceParameterValueNormalizedOnRemote(param, val));
	}, [dispatch]);

	const onRemoveParamFromSetView = useCallback((param: ParameterRecord) => {
		if (!currentSetView) return;
		dispatch(removeParameterFromSetView(currentSetView, param));
	}, [dispatch, currentSetView]);

	const onDecreaseParamIndexInSetView = useCallback((param: ParameterRecord) => {
		if (!currentSetView) return;
		dispatch(decreaseParameterIndexInSetView(currentSetView, param));
	}, [dispatch, currentSetView]);

	const onIncreaseParamIndexInSetView = useCallback((param: ParameterRecord) => {
		if (!currentSetView) return;
		dispatch(increaseParameterIndexInSetView(currentSetView, param));
	}, [dispatch, currentSetView]);

	return (
		<>
			<Stack>
				<Group justify="space-between" wrap="nowrap">
					<div style={{ flex: "1 2 50%" }} >
						<Title size="md" my={ 0 } >
							{
								currentSetView?.name || "No SetView loaded"
							}
						</Title>
					</div>
					<Group style={{ flex: "0" }} wrap="nowrap" gap="xs" >
						<ResponsiveButton
							label="SetViews"
							tooltip="Open SetView Menu"
							icon={ mdiKnob }
							onClick={ openSetViewDrawer }
						/>
					</Group>
				</Group>
				<div>
					{
						!currentSetViewParameters ? null : (
							<SetViewParameterList
								parameters={ currentSetViewParameters }
								onDecreaseParamIndex={ onDecreaseParamIndexInSetView }
								onIncreaseParamIndex={ onIncreaseParamIndexInSetView }
								onSetNormalizedParamValue={ onSetNormalizedParamValue }
								onRemoveParamFromSetView={ onRemoveParamFromSetView }
							/>
						)
					}
				</div>
			</Stack>
			<SetViewDrawer
				open={ setViewDrawerOpen }
				onClose={ closeSetViewDrawer }
				onCreateSetView={ onCreateSetView }
				onDeleteSetView={ onDeleteSetView }
				onLoadSetView={ onLoadSetView }
				onRenameSetView={ onRenameSetView }
				currentSetView={ currentSetView }
				setViews={ setViews }
			/>
		</>
	);
}
