import { Group, MantineFontSize, MantineStyleProps, Table, Text, UnstyledButton } from "@mantine/core";
import { FC, PropsWithChildren, useCallback } from "react";
import { SortOrder } from "../../lib/constants";
import { IconElement } from "./icon";
import { mdiChevronDown, mdiChevronUp, mdiUnfoldMoreHorizontal } from "@mdi/js";

export type TableHeaderCellProps = PropsWithChildren<{
	className?: string;
	fz?: MantineFontSize;

	onSort?: (sortKey: string) => void;
	sorted?: boolean;
	sortKey?: string;
	sortOrder?: SortOrder;
	width?: MantineStyleProps["w"];
}>;

export const TableHeaderCell: FC<TableHeaderCellProps> = ({
	children,
	className,
	fz = "sm",

	onSort,
	sorted = false,
	sortKey,
	sortOrder = SortOrder.Asc,

	width = undefined

}) => {

	const onTriggerSort = useCallback(() => {
		onSort?.(sortKey);
	}, [onSort, sortKey]);

	return (
		<Table.Th className={ className } w={ width } >
			{
				onSort ? (
					<UnstyledButton onClick={ onTriggerSort } >
						<Group justify="space-between">
							<Text fw="bold" fz={ fz } >
								{ children }
							</Text>
							{
								sorted
									? <IconElement size={ 0.7 } path={ sortOrder === SortOrder.Asc ? mdiChevronDown : mdiChevronUp } />
									: <IconElement size={ 0.5 } path={ mdiUnfoldMoreHorizontal } color={ "gray.6" } />
							}
						</Group>
					</UnstyledButton>
				) : (
					<Text fw="bold" fz={ fz } >
						{ children }
					</Text>
				)
			}
		</Table.Th>
	);
};
