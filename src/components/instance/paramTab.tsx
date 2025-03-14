import { ActionIcon, Button, Group, Popover, SegmentedControl, Select, Stack, Text, Tooltip } from "@mantine/core";
import { ComponentType, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { ParameterSortAttr, SortOrder } from "../../lib/constants";
import ParameterList, { ParameterListProps } from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { PatcherInstanceRecord } from "../../models/instance";
import {
	restoreDefaultParameterMetaOnRemote, setInstanceParameterMetaOnRemote,
	setInstanceParameterValueNormalizedOnRemote,
	setInstanceWaitingForMidiMappingOnRemote, clearParameterMIDIMappingOnRemote,
	activateParameterMIDIMappingFocus
} from "../../actions/patchers";
import { OrderedSet as ImmuOrderedSet, Map as ImmuMap } from "immutable";
import { setAppSetting } from "../../actions/settings";
import { AppSetting, AppSettingRecord } from "../../models/settings";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconElement } from "../elements/icon";
import { mdiMidiPort, mdiSort, mdiSortAscending, mdiSortDescending } from "@mdi/js";
import { ParameterMIDIActionsProps, withParameterMIDIActions } from "../parameter/withMidiActions";
import ParameterItem from "../parameter/item";
import { SearchInput } from "../page/searchInput";

const ParameterComponentType = withParameterMIDIActions(ParameterItem);
const ParameterListComponent: ComponentType<ParameterListProps<ParameterMIDIActionsProps>> = ParameterList;

const collator = new Intl.Collator("en-US");
const parameterComparators: Record<ParameterSortAttr, Record<SortOrder, (a: ParameterRecord, b: ParameterRecord) => number>> = {
	[ParameterSortAttr.Index]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.index < b.index) return -1;
			if (a.index > b.index) return 1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.index > b.index) return -1;
			if (a.index < b.index) return 1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	},
	[ParameterSortAttr.Name]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	}
};

const getSortedParameterIds = (params: ImmuMap<ParameterRecord["id"], ParameterRecord>, attr: ParameterSortAttr, order: SortOrder): ImmuOrderedSet<ParameterRecord["id"]> => {
	return ImmuOrderedSet<ParameterRecord["id"]>(params.valueSeq().sort(parameterComparators[attr][order]).map(p => p.id));
};

export type InstanceParameterTabProps = {
	instance: PatcherInstanceRecord;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	sortAttr: AppSettingRecord;
	sortOrder: AppSettingRecord;
}

const InstanceParameterTab: FunctionComponent<InstanceParameterTabProps> = memo(function WrappedInstanceParameterTab({
	instance,
	parameters,
	sortAttr,
	sortOrder
}) {

	const [searchValue, setSearchValue] = useState<string>("");
	const [sortedParameterIds, setSortedParameterIds] = useState<ImmuOrderedSet<ParameterRecord["id"]>>(ImmuOrderedSet<ParameterRecord["id"]>());

	const dispatch = useAppDispatch();

	const onChangeSortOrder = useCallback((value: string) => {
		dispatch(setAppSetting(AppSetting.paramSortOrder, value));
	}, [dispatch]);

	const onChangeSortAttr = useCallback((value: string) => {
		dispatch(setAppSetting(AppSetting.paramSortAttribute, value));
	}, [dispatch]);

	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setInstanceParameterValueNormalizedOnRemote(param, val));
	}, [dispatch]);

	const onSaveParameterMetadata = useCallback((param: ParameterRecord, meta: string) => {
		dispatch(setInstanceParameterMetaOnRemote(param, meta));
	}, [dispatch]);

	const onRestoreDefaultParameterMetadata = useCallback((param: ParameterRecord) => {
		dispatch(restoreDefaultParameterMetaOnRemote(param));
	}, [dispatch]);

	const onToggleMIDIMapping = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		e.currentTarget.blur();
		dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, !instance.waitingForMidiMapping));
	}, [dispatch, instance]);

	const onActivateParameterMIDIMapping = useCallback((param: ParameterRecord) => {
		dispatch(activateParameterMIDIMappingFocus(param));
	}, [dispatch]);

	const onClearParameterMidiMapping = useCallback((param: ParameterRecord) => {
		dispatch(clearParameterMIDIMappingOnRemote(param));
	}, [dispatch]);

	const onSearch = useDebouncedCallback((query: string) => {
		setSearchValue(query);
	}, 150);

	useEffect(() => {
		setSortedParameterIds(getSortedParameterIds(parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));
	}, [instance, parameters.size, sortAttr, sortOrder]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Escape" && instance.waitingForMidiMapping && document.activeElement instanceof HTMLElement && document.activeElement.nodeName !== "INPUT") {
				dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, false));
			}
		};
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [instance, dispatch]);

	useEffect(() => {
		return () => {
			dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, false));
		};
	}, [instance.id, dispatch]);

	const displayParameters = ImmuOrderedSet<ParameterRecord>().withMutations(set => {
		sortedParameterIds.forEach(id => {
			const p = parameters.get(id);
			if (p && (!searchValue?.length || p.matchesQuery(searchValue))) {
				set.add(p);
			}
		});
	});

	return (
		<Stack gap="md" h="100%">
			<Group justify="space-between">
				<Tooltip label={ instance.waitingForMidiMapping ? "Disable MIDI Mapping" : "Enable MIDI Mapping" } >
					<ActionIcon
						onClick={ onToggleMIDIMapping }
						variant={ instance.waitingForMidiMapping ? "filled" : "default" }
						color={ instance.waitingForMidiMapping ? "violet.4" : undefined }
					>
						<IconElement path={ mdiMidiPort } />
					</ActionIcon>
				</Tooltip>
				<Group justify="flex-end" gap="xs">
					<SearchInput onSearch={ onSearch } />
					<Popover position="bottom-end" withArrow>
						<Popover.Target>
							<Button size="xs" variant="default" leftSection={ <IconElement path={ mdiSort } /> } >
								Sort
							</Button>
						</Popover.Target>
						<Popover.Dropdown>
							<Stack gap="sm">
								<Select
									size="xs"
									label="Sort By"
									name="sort_attribute"
									onChange={ onChangeSortAttr }
									data={ sortAttr.options }
									value={ sortAttr.value as string }
								/>
								<div>
									<Text size="xs">Sort Order</Text>
									<SegmentedControl
										size="xs"
										fullWidth
										onChange={ onChangeSortOrder }
										data={ [{ label: <IconElement path={ mdiSortAscending } />, value: SortOrder.Asc }, { label: <IconElement path={ mdiSortDescending } />, value: SortOrder.Desc }] }
										value={ sortOrder.value as string }
									/>
								</div>
							</Stack>
						</Popover.Dropdown>
					</Popover>
				</Group>
			</Group>
			{
				!parameters.size ? (
					<div className={ classes.emptySection }>
						This device has no parameters
					</div>
				) : (
					<div className={ classes.paramSectionWrap } >
						<ParameterListComponent
							parameters={ displayParameters }
							onRestoreMetadata={ onRestoreDefaultParameterMetadata }
							onSaveMetadata={ onSaveParameterMetadata }
							onSetNormalizedValue={ onSetNormalizedParamValue }
							ParamComponentType={ ParameterComponentType }
							extraParameterProps={{
								instanceIsMIDIMapping: instance.waitingForMidiMapping,
								onActivateMIDIMapping: onActivateParameterMIDIMapping,
								onClearMidiMapping: onClearParameterMidiMapping
							}}
						/>
					</div>
				)
			}
		</Stack>
	);
});

export default InstanceParameterTab;
