import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getGraphSetViewsBySortOrder, getSelectedGraphSetView } from "../selectors/sets";
import { MouseEvent, useCallback, useEffect } from "react";
import { ActionIcon, Group, Menu, Stack, Tooltip } from "@mantine/core";
import { mdiDotsVertical, mdiMidiPort, mdiPencil, mdiPlus, mdiTableEye, mdiTrashCan, mdiTune } from "@mdi/js";
import { useDisclosure } from "@mantine/hooks";
import { createSetViewOnRemote, destroySetViewOnRemote, loadSetView, decreaseParameterIndexInSetView, increaseParameterIndexInSetView, removeParameterFromSetView, renameSetViewOnRemote, setViewContainedInstancesWaitingForMidiMappingOnRemote, renameSelectedSetViewOnRemote  } from "../actions/sets";
import SetViewDrawer from "../components/setViews/drawer";
import { GraphSetViewRecord } from "../models/set";
import { getPatcherInstanceParametersBySetView, getPatcherInstances, getPatcherInstancesAreWaitingForMIDIMappingBySetView } from "../selectors/patchers";
import { SetViewParameterList } from "../components/setViews/parameterList";
import { ParameterRecord } from "../models/parameter";
import { activateParameterMIDIMappingFocus, clearParameterMIDIMappingOnRemote, restoreDefaultParameterMetaOnRemote, setInstanceParameterMetaOnRemote, setInstanceParameterValueNormalizedOnRemote } from "../actions/patchers";
import { SetViewParameterModal } from "../components/setViews/paramModal";
import { IconElement } from "../components/elements/icon";
import { PageTitle } from "../components/page/title";
import { getAppSetting } from "../selectors/settings";
import { AppSetting } from "../models/settings";

export default function SetViews() {

	const [setViewDrawerOpen, { open: openSetViewDrawer, close: closeSetViewDrawer }] = useDisclosure(false);
	const [addParametersViewOpen, { open: openAddParametersView, close: closeAddParametersView }] = useDisclosure(false);
	const dispatch = useAppDispatch();

	const [
		currentSetView,
		currentSetViewParameters,
		currentSetViewIsMIDIMapping,
		setViews,
		paramThumbSize,
		paramTrackSize,
		patcherInstances
	] = useAppSelector((state: RootStateType) => {
		const current = getSelectedGraphSetView(state);
		return [
			current,
			current ? getPatcherInstanceParametersBySetView(state, current) : undefined,
			current ? getPatcherInstancesAreWaitingForMIDIMappingBySetView(state, current) : false,
			getGraphSetViewsBySortOrder(state),
			getAppSetting(state, AppSetting.paramThumbSize),
			getAppSetting(state, AppSetting.paramTrackSize),
			getPatcherInstances(state)
		];
	});

	const onCreateSetView = useCallback(() => {
		dispatch(createSetViewOnRemote());
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

	const onTriggerRenameSelectedSetView = useCallback(() => {
		dispatch(renameSelectedSetViewOnRemote());
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
						<PageTitle>
							{
								currentSetView?.name || "No Parameter View Loaded"
							}
						</PageTitle>
					</div>
					<Group wrap="nowrap" gap="xs">
						<Tooltip label={ currentSetViewIsMIDIMapping ? "Disable MIDI Mapping" : "Enable MIDI Mapping" } >
							<ActionIcon
								onClick={ onToggleMIDIMapping }
								variant={ currentSetViewIsMIDIMapping ? "filled" : "default" }
								color={ currentSetViewIsMIDIMapping ? "violet.4" : undefined }
								size="lg"
							>
								<IconElement path={ mdiMidiPort } />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Open Parameter View Menu">
							<ActionIcon onClick={ openSetViewDrawer } variant="default" size="lg">
								<IconElement path={ mdiTableEye } />
							</ActionIcon>
						</Tooltip>
						<Menu position="bottom-end">
							<Menu.Target>
								<ActionIcon variant="default" size="lg">
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Label>Parameter View</Menu.Label>
								<Menu.Item leftSection={ <IconElement path={ mdiPlus } /> } onClick={ onCreateSetView } >
									New View
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item leftSection={ <IconElement path={ mdiTune } /> } onClick={ openAddParametersView } disabled={ !currentSetView } >
									Manage Parameters
								</Menu.Item>
								<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } disabled={ !currentSetView } onClick={ onTriggerRenameSelectedSetView } >
									Rename
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item leftSection={ <IconElement path={ mdiTrashCan } /> } color="red" disabled={ !currentSetView } >
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>
				<div>
					{
						!currentSetViewParameters ? null : (
							<SetViewParameterList
								parameters={ currentSetViewParameters }
								thumbSize={ paramThumbSize }
								trackSize={ paramTrackSize }
								patcherInstances={ patcherInstances }
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
						onClose={ closeAddParametersView }
						setView={ currentSetView }
					/>
				) : null
			}

		</>
	);
}
