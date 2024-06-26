import { ActionIcon, Button, Group, Popover, SegmentedControl, Select, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { ChangeEvent, FC, FunctionComponent, MouseEvent, KeyboardEvent as ReactKeyboardEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { ParameterSortAttr, SortOrder } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { InstanceStateRecord } from "../../models/instance";
import {
	restoreDefaultParameterMetaOnRemote, setInstanceParameterMetaOnRemote,
	setInstanceParameterValueNormalizedOnRemote,
	setInstanceWaitingForMidiMappingOnRemote, clearParameterMidiMappingOnRemote,
	activateParameterMIDIMappingFocus
} from "../../actions/instances";
import { OrderedSet as ImmuOrderedSet } from "immutable";
import { setAppSetting } from "../../actions/settings";
import { AppSetting, AppSettingRecord } from "../../models/settings";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import { IconElement } from "../elements/icon";
import { mdiClose, mdiMagnify, mdiMidiPort, mdiSort, mdiSortAscending, mdiSortDescending } from "@mdi/js";

type ParameterSearchInputProps = {
	onSearch: (query: string) => any;
}

const ParameterSearchInput: FC<ParameterSearchInputProps> = memo(function WrappedParameterSearchInput({
	onSearch
}) {

	const [showSearchInput, showSearchInputActions] = useDisclosure();
	const [searchValue, setSearchValue] = useState<string>("");
	const searchInputRef = useRef<HTMLInputElement>();

	const onChangeSearchValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	}, [setSearchValue]);

	const onBlur = useCallback(() => {
		if (!searchValue?.length) showSearchInputActions.close();
	}, [searchValue, showSearchInputActions]);

	const onClear = useCallback(() => {
		setSearchValue("");
		searchInputRef.current?.focus();
	}, [setSearchValue]);

	const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			if (searchValue.length) {
				setSearchValue("");
			} else {
				searchInputRef.current?.blur();
			}
		}
	}, [setSearchValue, searchInputRef, searchValue]);

	useEffect(() => {
		onSearch(searchValue);
	}, [searchValue, onSearch]);

	return (
		showSearchInput || searchValue?.length ? (
			<TextInput
				autoFocus
				ref={ searchInputRef }
				onKeyDown={ onKeyDown }
				onBlur={ onBlur }
				onChange={ onChangeSearchValue }
				leftSection={ <IconElement path={ mdiMagnify } /> } size="xs"
				rightSection={(
					<ActionIcon variant="transparent" color="gray" onClick={ onClear } >
						<IconElement path={ mdiClose } size="1em" />
					</ActionIcon>
				)}
				value={ searchValue }
			/>
		) : (
			<ActionIcon size="md" variant="default" onClick={ showSearchInputActions.open } >
				<IconElement path={ mdiMagnify } />
			</ActionIcon>
		)
	);
});

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

const getSortedParameterIds = (params: InstanceStateRecord["parameters"], attr: ParameterSortAttr, order: SortOrder): ImmuOrderedSet<string> => {
	return ImmuOrderedSet<string>(params.valueSeq().sort(parameterComparators[attr][order]).map(p => p.id));
};

export type InstanceParameterTabProps = {
	instance: InstanceStateRecord;
	sortAttr: AppSettingRecord;
	sortOrder: AppSettingRecord;
}

const InstanceParameterTab: FunctionComponent<InstanceParameterTabProps> = memo(function WrappedInstanceParameterTab({
	instance,
	sortAttr,
	sortOrder
}) {

	const [searchValue, setSearchValue] = useState<string>("");
	const [sortedParamIds, setSortedParamIds] = useState<ImmuOrderedSet<ParameterRecord["id"]>>(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));

	const dispatch = useAppDispatch();

	const onChangeSortOrder = useCallback((value: string) => {
		dispatch(setAppSetting(AppSetting.paramSortOrder, value));
	}, [dispatch]);

	const onChangeSortAttr = useCallback((value: string) => {
		dispatch(setAppSetting(AppSetting.paramSortAttribute, value));
	}, [dispatch]);

	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setInstanceParameterValueNormalizedOnRemote(instance, param, val));
	}, [dispatch, instance]);

	const onSaveParameterMetadata = useCallback((param: ParameterRecord, meta: string) => {
		dispatch(setInstanceParameterMetaOnRemote(instance, param, meta));
	}, [dispatch, instance]);

	const onRestoreDefaultParameterMetadata = useCallback((param: ParameterRecord) => {
		dispatch(restoreDefaultParameterMetaOnRemote(instance, param));
	}, [dispatch, instance]);

	const onToggleMIDIMapping = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		e.currentTarget.blur();
		dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, !instance.waitingForMidiMapping));
	}, [dispatch, instance]);

	const onActivateParameterMIDIMapping = useCallback((param: ParameterRecord) => {
		dispatch(activateParameterMIDIMappingFocus(instance, param));
	}, [dispatch, instance]);

	const onClearParameterMidiMapping = useCallback((param: ParameterRecord) => {
		dispatch(clearParameterMidiMappingOnRemote(instance.id, param.id));
	}, [dispatch, instance]);

	const onSearch = useDebouncedCallback((query: string) => {
		setSearchValue(query);
	}, 150);

	useEffect(() => {
		setSortedParamIds(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));
	}, [instance, sortAttr, sortOrder]);

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

	let parameters = sortedParamIds.map(id => instance.parameters.get(id)).filter(p => !!p);
	if (searchValue?.length) parameters = parameters.filter(p => p.matchesQuery(searchValue));

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
					<ParameterSearchInput onSearch={ onSearch } />
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
				!instance.parameters.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no parameters
					</div>
				) : (
					<div className={ classes.paramSectionWrap } >
						<ParameterList
							parameters={ parameters }
							isMIDIMapping={ instance.waitingForMidiMapping }
							onActivateMIDIMapping={ onActivateParameterMIDIMapping }
							onSetNormalizedValue={ onSetNormalizedParamValue }
							onSaveMetadata={ onSaveParameterMetadata }
							onRestoreMetadata={ onRestoreDefaultParameterMetadata }
							onClearMidiMapping={ onClearParameterMidiMapping }
						/>
					</div>
				)
			}
		</Stack>
	);
});

export default InstanceParameterTab;
