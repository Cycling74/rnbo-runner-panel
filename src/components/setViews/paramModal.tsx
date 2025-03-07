import { Accordion, ActionIcon, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { FC, memo, useCallback } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { mdiMinusBox, mdiMinusBoxMultiple, mdiPlusBox, mdiPlusBoxMultiple, mdiTune } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { GraphSetViewRecord } from "../../models/set";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getPatcherInstancesAndParameters } from "../../selectors/patchers";
import { PatcherInstanceRecord } from "../../models/instance";
import { OrderedSet as ImmuOrderedSet, Seq } from "immutable";
import { ParameterRecord } from "../../models/parameter";
import { ResponsiveButton } from "../elements/responsiveButton";
import { addAllParametersToSetView, addParameterToSetView, removeAllParametersFromSetView, removeParameterFromSetView } from "../../actions/sets";
import classes from "./setviews.module.css";
import { modals } from "@mantine/modals";

export type SetViewParameterModalProps = {
	onClose: () => void;
	setView: GraphSetViewRecord;
};

type ParamEntryProps = {
	isInSet: boolean;
	onAdd: (param: ParameterRecord) => void;
	onRemove: (param: ParameterRecord) => void;
	parameter: ParameterRecord;
};

const ParameterEntry: FC<ParamEntryProps> = memo(function WrappedParameterEntry({
	isInSet,
	onAdd,
	onRemove,
	parameter
}) {

	const onTriggerAdd = () => onAdd(parameter);
	const onTriggerRemove = () => onRemove(parameter);

	return (
		<li className={ classes.instanceParameterEntry } >
			<Group gap="xs" >
				<div className={ classes.instanceParameterEntryName } >
					{ parameter.name }
				</div>
				<ActionIcon.Group>
					<ActionIcon onClick={ onTriggerAdd } variant="subtle" disabled={ isInSet } >
						<IconElement path={ mdiPlusBox } />
					</ActionIcon>
					<ActionIcon onClick={ onTriggerRemove } variant="subtle" color="red" disabled={ !isInSet } >
						<IconElement path={ mdiMinusBox } />
					</ActionIcon>
				</ActionIcon.Group>
			</Group>
		</li>
	);
});

type InstanceEntryProps = {
	instance: PatcherInstanceRecord;
	onAddParameter: ParamEntryProps["onAdd"];
	onRemoveParameter: ParamEntryProps["onRemove"];
	parameters: Seq.Indexed<ParameterRecord>;
	setViewParamIds: ImmuOrderedSet<string>;
};

const InstanceEntry: FC<InstanceEntryProps> = memo(function WrapedInstanceEntry({
	instance,
	onAddParameter,
	onRemoveParameter,
	parameters,
	setViewParamIds
}) {
	return (
		<Accordion.Item value={ instance.id } >
			<Accordion.Control>
				<Title size="xs">{ instance.displayName }</Title>
			</Accordion.Control>
			<Accordion.Panel>
				<ul className={ classes.instanceParameterList } >
					{
						parameters.map(p => (
							<ParameterEntry key={ p.id } parameter={ p } onAdd={ onAddParameter } onRemove={ onRemoveParameter } isInSet={ setViewParamIds.has(p.setViewId) } />
						))
					}
				</ul>
			</Accordion.Panel>
		</Accordion.Item>
	);
});

export const SetViewParameterModal: FC<SetViewParameterModalProps> = memo(function WrappedSetViewParameterModal({
	onClose,
	setView
}) {

	const showFullScreen = useIsMobileDevice();
	const dispatch = useAppDispatch();
	const [
		instanceParamInfo
	] = useAppSelector((state: RootStateType) => [
		getPatcherInstancesAndParameters(state)
	]);

	const onAddAllParametersToSetView = useCallback(() => {
		modals.openConfirmModal({
			title: "Include all parameters",
			centered: true,
			children: (
				<Text size="sm" id="red">
					Are you sure you want to append all missing parameters from all devices to { `"${setView.name}"` }? This action cannot be undone.
				</Text>
			),
			labels: { confirm: "Add", cancel: "Cancel" },
			onConfirm: () => dispatch(addAllParametersToSetView(setView))
		});

	}, [dispatch, setView]);

	const onRemoveAllParametersFromSetView = useCallback(() => {
		modals.openConfirmModal({
			title: "Remove all parameters",
			centered: true,
			children: (
				<Text size="sm" id="red">
					Are you sure you want to remove all parameters from { `"${setView.name}"` }? This action cannot be undone.
				</Text>
			),
			labels: { confirm: "Remove", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(removeAllParametersFromSetView(setView))
		});
	}, [dispatch, setView]);

	const onAddParameterToSetView = useCallback((param: ParameterRecord) => {
		dispatch(addParameterToSetView(setView, param));
	}, [dispatch, setView]);

	const onRemoveParamterFromSetView = useCallback((param: ParameterRecord) => {
		dispatch(removeParameterFromSetView(setView, param));
	}, [dispatch, setView]);

	return (
		<Modal.Root opened onClose={ onClose } fullScreen={ showFullScreen } size="xl">
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>
						<Group gap="xs">
							<IconElement path={ mdiTune } />
							Manage Parameters
						</Group>
					</Modal.Title>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body>
					<Stack gap="md">
						<Group justify="flex-end" >
							<ResponsiveButton
								label="Include All"
								tooltip="Include all parameters"
								icon={ mdiPlusBoxMultiple }
								onClick={ onAddAllParametersToSetView }
							/>
							<ResponsiveButton
								label="Remove All"
								color="red"
								variant="outline"
								tooltip="Remove all parameters"
								icon={ mdiMinusBoxMultiple }
								onClick={ onRemoveAllParametersFromSetView }
							/>
						</Group>
						<Accordion variant="separated" >
							{
								instanceParamInfo.valueSeq().map(({ instance, parameters}) => (
									<InstanceEntry
										key={ instance.id }
										instance={ instance }
										onAddParameter={ onAddParameterToSetView }
										onRemoveParameter={ onRemoveParamterFromSetView }
										parameters={ parameters }
										setViewParamIds={ setView.paramIds }
									/>
								))
							}
						</Accordion>
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
