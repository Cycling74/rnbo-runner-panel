import { Set as ImmuSet } from "immutable";
import { Accordion, ActionIcon, Group, Modal, Stack, Title } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
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
import { SearchInput } from "../page/searchInput";

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
					{ parameter.label }
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
	const [searchValue, setSearchValue] = useState<string>("");
	const [
		instanceParamInfo
	] = useAppSelector((state: RootStateType) => [
		getPatcherInstancesAndParameters(state, searchValue)
	]);


	const [revealedInstances, setRevealedInstances] = useState<ImmuSet<PatcherInstanceRecord["id"]>>(ImmuSet());

	const onAddAllParametersToSetView = useCallback(() => {
		dispatch(addAllParametersToSetView(setView));
	}, [dispatch, setView]);

	const onRemoveAllParametersFromSetView = useCallback(() => {
		dispatch(removeAllParametersFromSetView(setView));
	}, [dispatch, setView]);

	const onAddParameterToSetView = useCallback((param: ParameterRecord) => {
		dispatch(addParameterToSetView(setView, param));
	}, [dispatch, setView]);

	const onRemoveParamterFromSetView = useCallback((param: ParameterRecord) => {
		dispatch(removeParameterFromSetView(setView, param));
	}, [dispatch, setView]);

	const onChangeAccordion = useCallback((value: string[]) => {
		setRevealedInstances(ImmuSet(value));
	}, [setRevealedInstances]);

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
						<Group justify="space-between" >
							<Group>
								<ResponsiveButton
									label="Include All"
									tooltip="Include all parameters"
									icon={ mdiPlusBoxMultiple }
									onClick={ onAddAllParametersToSetView }
									size="xs"
								/>
								<ResponsiveButton
									label="Remove All"
									color="red"
									variant="outline"
									tooltip="Remove all parameters"
									icon={ mdiMinusBoxMultiple }
									onClick={ onRemoveAllParametersFromSetView }
									size="xs"
								/>
							</Group>
							<SearchInput onSearch={ setSearchValue } />
						</Group>
						<Accordion variant="separated"
							multiple
							onChange={ onChangeAccordion }
							transitionDuration={ 30 }
							value={ searchValue?.length ? instanceParamInfo.valueSeq().map(({ instance }) => instance.id).toArray() : revealedInstances.toArray() }
						>
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
