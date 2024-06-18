import { Button, Group, Popover, SegmentedControl, Select, Stack, Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback, useEffect, useState } from "react";
import { InstanceTab, ParameterSortAttr, SortOrder } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { InstanceStateRecord } from "../../models/instance";
import { setInstanceParameterValueNormalizedOnRemote } from "../../actions/instances";
import { Seq } from "immutable";
import { RootStateType } from "../../lib/store";
import { getParameterSortAttribute, getParameterSortOrder } from "../../selectors/instances";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faArrowUpAZ, faSort } from "@fortawesome/free-solid-svg-icons";
import { setAppSetting } from "../../actions/settings";
import { AppSetting } from "../../models/settings";

export type InstanceParameterTabProps = {
	instance: InstanceStateRecord;
}

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

const getSortedParameterIds = (params: InstanceStateRecord["parameters"], attr: ParameterSortAttr, order: SortOrder): Seq.Indexed<string> => {
	return params.valueSeq().sort(parameterComparators[attr][order]).map(p => p.id);
};

const InstanceParameterTab: FunctionComponent<InstanceParameterTabProps> = memo(function WrappedInstanceParameterTab({
	instance
}) {

	const [sortAttr, sortOrder] = useAppSelector((state: RootStateType) => [
		getParameterSortAttribute(state),
		getParameterSortOrder(state)
	]);

	const [sortedParamIds, setSortedParamIds] = useState<Seq.Indexed<string>>(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));

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

	useEffect(() => {
		setSortedParamIds(getSortedParameterIds(instance.parameters, sortAttr.value as ParameterSortAttr, sortOrder.value as SortOrder));
	}, [instance.id, sortAttr, sortOrder]);

	return (
		<Tabs.Panel value={ InstanceTab.Parameters } >
			<Stack gap="md" h="100%">
				<Group justify="flex-end" gap="xs">
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
							<ParameterList parameters={ sortedParamIds.map(id => instance.parameters.get(id)) } onSetNormalizedValue={ onSetNormalizedParamValue } />
						</div>
					)
				}
			</Stack>
		</Tabs.Panel>
	);
});

export default InstanceParameterTab;
