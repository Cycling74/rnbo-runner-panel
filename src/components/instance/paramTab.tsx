import { ActionIcon, Button, Group, Popover, SegmentedControl, Select, Stack, Tabs, Text, TextInput } from "@mantine/core";
import { ChangeEvent, FC, FunctionComponent, KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { InstanceTab, ParameterSortAttr, SortOrder } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { InstanceStateRecord } from "../../models/instance";
import { setInstanceParameterValueNormalizedOnRemote } from "../../actions/instances";
import { OrderedSet } from "immutable";
import { RootStateType } from "../../lib/store";
import { getParameterSortAttribute, getParameterSortOrder } from "../../selectors/instances";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faArrowUpAZ, faSearch, faSort, faXmark } from "@fortawesome/free-solid-svg-icons";
import { setAppSetting } from "../../actions/settings";
import { AppSetting } from "../../models/settings";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";


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

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
				leftSection={ <FontAwesomeIcon icon={ faSearch } size="xs" /> } size="xs"
				rightSection={(
					<ActionIcon variant="transparent" color="gray" onClick={ onClear } >
						<FontAwesomeIcon icon={ faXmark } size="xs" />
					</ActionIcon>
				)}
				value={ searchValue }
			/>
		) : (
			<ActionIcon size="md" variant="default" onClick={ showSearchInputActions.open } >
				<FontAwesomeIcon icon={ faSearch } size="xs" />
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

const getSortedParameterIds = (params: InstanceStateRecord["parameters"], attr: ParameterSortAttr, order: SortOrder): OrderedSet<string> => {
	return OrderedSet<string>(params.valueSeq().sort(parameterComparators[attr][order]).map(p => p.id));
};

export type InstanceParameterTabProps = {
	instance: InstanceStateRecord;
}

const InstanceParameterTab: FunctionComponent<InstanceParameterTabProps> = memo(function WrappedInstanceParameterTab({
	instance
}) {

	const [sortAttr, sortOrder] = useAppSelector((state: RootStateType) => [
		getParameterSortAttribute(state),
		getParameterSortOrder(state)
	]);

	const [searchValue, setSearchValue] = useState<string>("");

	const [sortedParamIds, setSortedParamIds] = useState<OrderedSet<ParameterRecord["id"]>>(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));

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

	const onSearch = useDebouncedCallback((query: string) => {
		setSearchValue(query);
	}, 150);

	useEffect(() => {
		setSortedParamIds(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));
	}, [instance.id, sortAttr, sortOrder]);

	let parameters = sortedParamIds.map(id => instance.parameters.get(id)).filter(p => !!p);
	if (searchValue?.length) parameters = parameters.filter(p => p.matchesQuery(searchValue));

	return (
		<Tabs.Panel value={ InstanceTab.Parameters } >
			<Stack gap="md" h="100%">
				<Group justify="flex-end" gap="xs">
					<ParameterSearchInput onSearch={ onSearch } />
					<Popover position="bottom-end" withArrow>
						<Popover.Target>
							<Button size="xs" variant="default" leftSection={ <FontAwesomeIcon icon={ faSort } /> } >
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
										data={ [{ label: <FontAwesomeIcon icon={ faArrowDownAZ } size="sm" />, value: SortOrder.Asc }, { label: <FontAwesomeIcon icon={ faArrowUpAZ } size="sm" />, value: SortOrder.Desc }] }
										value={ sortOrder.value as string }
									/>
								</div>
							</Stack>
						</Popover.Dropdown>
					</Popover>
				</Group>
				{
					!instance.parameters.size ? (
						<div className={ classes.emptySection }>
							This patcher instance has no parameters
						</div>
					) : (
						<div className={ classes.paramSectionWrap } >
							<ParameterList parameters={ parameters } onSetNormalizedValue={ onSetNormalizedParamValue } />
						</div>
					)
				}
			</Stack>
		</Tabs.Panel>
	);
});

export default InstanceParameterTab;
