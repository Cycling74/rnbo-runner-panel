import { Button, Group, Menu, SegmentedControl, Select, Stack, Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback, useEffect, useState } from "react";
import { InstanceTab, ParameterSortAttr, SortOrder } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { InstanceStateRecord } from "../../models/instance";
import { setInstanceParameterValueNormalizedOnRemote, setParameterSortAttribute, setParameterSortOrder } from "../../actions/instances";
import { Seq } from "immutable";
import { RootStateType } from "../../lib/store";
import { getParameterSortAttribute, getParameterSortOrder } from "../../selectors/instances";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faArrowUpAZ, faSort } from "@fortawesome/free-solid-svg-icons";

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

	const [sortedParamIds, setSortedParamIds] = useState<Seq.Indexed<string>>(getSortedParameterIds(instance.parameters, sortAttr, sortOrder));

	const dispatch = useAppDispatch();

	const onChangeSortOrder = useCallback((value: string) => {
		dispatch(setParameterSortOrder(value as SortOrder));
	}, [dispatch]);

	const onChangeSortAttr = useCallback((value: string) => {
		dispatch(setParameterSortAttribute(value as ParameterSortAttr));
	}, [dispatch]);

	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setInstanceParameterValueNormalizedOnRemote(instance, param, val));
	}, [dispatch, instance]);

	useEffect(() => {
		setSortedParamIds(getSortedParameterIds(instance.parameters, sortAttr, sortOrder));
	}, [instance.id, sortAttr, sortOrder]);

	return (
		<Tabs.Panel value={ InstanceTab.Parameters } >
			<Stack gap="md" h="100%">
				<Group justify="flex-end" gap="xs">
					<Menu position="bottom-end">
						<Menu.Target>
							<Button size="xs" variant="default" leftSection={ <FontAwesomeIcon icon={ faSort } /> } >
								Sort
							</Button>
						</Menu.Target>
						<Menu.Dropdown>
							<Stack gap="xs" px="xs" py="xs">
								<Menu.Label>Sort By</Menu.Label>
								<SegmentedControl
									size="xs"
									onChange={ onChangeSortAttr }
									data={ [{ label: "Name", value: ParameterSortAttr.Name }, { label: "Index", value: ParameterSortAttr.Index }] }
									value={ sortAttr }
								/>
								<Menu.Label>Sort Order</Menu.Label>
								<SegmentedControl
									size="xs"
									onChange={ onChangeSortOrder }
									data={ [{ label: <FontAwesomeIcon icon={ faArrowDownAZ } size="sm" />, value: SortOrder.Asc }, { label: <FontAwesomeIcon icon={ faArrowUpAZ } size="sm" />, value: SortOrder.Desc }] }
									value={ sortOrder }
								/>
							</Stack>
						</Menu.Dropdown>
					</Menu>
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
