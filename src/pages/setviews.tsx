import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getGraphSetViewsBySortOrder, getSelectedGraphSetView } from "../selectors/sets";
import { MouseEvent, useCallback, useEffect } from "react";
import { ResponsiveButton } from "../components/elements/responsiveButton";
import { ActionIcon, Group, Stack, Title, Tooltip } from "@mantine/core";
import { mdiMidiPort, mdiTableEye, mdiTune } from "@mdi/js";
import { useDisclosure } from "@mantine/hooks";
import { createSetViewOnRemote, destroySetViewOnRemote, loadSetView, decreaseParameterIndexInSetView, increaseParameterIndexInSetView, removeParameterFromSetView, renameSetViewOnRemote, setViewContainedInstancesWaitingForMidiMappingOnRemote  } from "../actions/sets";
import SetViewDrawer from "../components/setViews/drawer";
import { GraphSetViewRecord } from "../models/set";
import { getPatcherInstanceParametersBySetView, getPatcherInstancesAreWaitingForMIDIMappingBySetView } from "../selectors/patchers";
import { SetViewParameterList } from "../components/setViews/parameterList";
import { ParameterRecord } from "../models/parameter";
import { activateParameterMIDIMappingFocus, clearParameterMIDIMappingOnRemote, restoreDefaultParameterMetaOnRemote, setInstanceParameterMetaOnRemote, setInstanceParameterValueNormalizedOnRemote } from "../actions/patchers";
import { SetViewParameterModal } from "../components/setViews/paramModal";
import { IconElement } from "../components/elements/icon";

export default function SetViews() {

	const [setViewDrawerOpen, { open: openSetViewDrawer, close: closeSetViewDrawer }] = useDisclosure(false);
	const [addParametersViewOpen, { open: openAddParametersView, close: closeAddParamtersView }] = useDisclosure(false);
	const dispatch = useAppDispatch();

	const [
		currentSetView,
		currentSetViewParameters,
		currentSetViewIsMIDIMapping,
		setViews
	] = useAppSelector((state: RootStateType) => {
		const current = getSelectedGraphSetView(state);
		return [
			current,
			current ? getPatcherInstanceParametersBySetView(state, current) : undefined,
			current ? getPatcherInstancesAreWaitingForMIDIMappingBySetView(state, current) : false,
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

	const onSaveParameterMetadata = useCallback((param: ParameterRecord, meta: string) => {
		dispatch(setInstanceParameterMetaOnRemote(param, meta));
	}, [dispatch]);

	const onRestoreDefaultParameterMetadata = useCallback((param: ParameterRecord) => {
		dispatch(restoreDefaultParameterMetaOnRemote(param));
	}, [dispatch]);

	const onToggleMIDIMapping = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		if (!currentSetView) return;
		e.currentTarget.blur();
		dispatch(setViewContainedInstancesWaitingForMidiMappingOnRemote(currentSetView, !currentSetViewIsMIDIMapping));
	}, [dispatch, currentSetView, currentSetViewIsMIDIMapping]);


	const onActivateParameterMIDIMapping = useCallback((param: ParameterRecord) => {
		dispatch(activateParameterMIDIMappingFocus(param));
	}, [dispatch]);

	const onClearParameterMIDIMapping = useCallback((param: ParameterRecord) => {
		dispatch(clearParameterMIDIMappingOnRemote(param));
	}, [dispatch]);

	useEffect(() => {
		return () => {
			if (!currentSetView) return;
			dispatch(setViewContainedInstancesWaitingForMidiMappingOnRemote(currentSetView, false));
		};
	}, [currentSetView, dispatch]);

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
						<Tooltip label={ currentSetViewIsMIDIMapping ? "Disable MIDI Mapping" : "Enable MIDI Mapping" } >
							<ActionIcon
								onClick={ onToggleMIDIMapping }
								variant={ currentSetViewIsMIDIMapping ? "filled" : "default" }
								color={ currentSetViewIsMIDIMapping ? "violet.4" : undefined }
							>
								<IconElement path={ mdiMidiPort } />
							</ActionIcon>
						</Tooltip>
						<ResponsiveButton
							label="Parameters"
							tooltip="Manage SetView Parameters"
							icon={ mdiTune }
							onClick={ openAddParametersView }
						/>
						<ResponsiveButton
							label="SetViews"
							tooltip="Open SetView Menu"
							icon={ mdiTableEye }
							onClick={ openSetViewDrawer }
						/>
					</Group>
				</Group>
				<div>
					{
						!currentSetViewParameters ? null : (
							<SetViewParameterList
								parameters={ currentSetViewParameters }
								waitingForMidiMapping={ currentSetViewIsMIDIMapping }
								onClearParamMIDIMapping={ onClearParameterMIDIMapping }
								onActivateParamMIDIMapping={ onActivateParameterMIDIMapping }
								onDecreaseParamIndex={ onDecreaseParamIndexInSetView }
								onIncreaseParamIndex={ onIncreaseParamIndexInSetView }
								onSetNormalizedParamValue={ onSetNormalizedParamValue }
								onRemoveParamFromSetView={ onRemoveParamFromSetView }
								onRestoreParamMetadata={ onRestoreDefaultParameterMetadata }
								onSaveParamMetadata={ onSaveParameterMetadata }
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
			{
				currentSetView && addParametersViewOpen ? (
					<SetViewParameterModal
						onClose={ closeAddParamtersView }
						setView={ currentSetView }
					/>
				) : null
			}

		</>
	);
}
