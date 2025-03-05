import { FC, memo, useCallback, useRef, useState } from "react";
import { PatcherExportRecord } from "../../models/patcher";
import { Seq } from "immutable";
import { ActionIcon, Alert, Anchor, Menu, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { mdiPlusBox } from "@mdi/js";
import { IconElement } from "../elements/icon";
import classes from "./addNodeMenu.module.css";

type PatcherMenuEntryProps = {
	onLoad: (p: PatcherExportRecord) => void;
	patcher: PatcherExportRecord;
};

const PatcherMenuEntry: FC<PatcherMenuEntryProps> = ({ patcher, onLoad }) => {
	return (
		<Menu.Item onClick={ () => onLoad(patcher) } >
			{ patcher.name }
		</Menu.Item>
	);
};

type AddPatcherInstanceMenuSectionProps = {
	onLoadPatcherInstance: (p: PatcherExportRecord) => void;
	patchers: Seq.Indexed<PatcherExportRecord>;
};

const AddPatcherInstanceMenuSection: FC<AddPatcherInstanceMenuSectionProps> = memo(function WrappedAddPatcherSection({
	onLoadPatcherInstance,
	patchers
}) {
	return (
		<div className={ classes.patcherMenuSection } >
			<Menu.Label>Patchers</Menu.Label>
			{
				!patchers.size ? (
					<Alert title="No Patcher available" variant="light" color="yellow">
						<Text size="xs">
							Please <Anchor inherit target="_blank" href="https://rnbo.cycling74.com/learn/export-targets-overview">export a RNBO patcher</Anchor> to load on the runner.
						</Text>
					</Alert>
				) : null
			}
			<div className={ classes.patcherMenuSectionList } >
				{
					patchers.map(p => <PatcherMenuEntry key={ p.id } patcher={ p } onLoad={ onLoadPatcherInstance } />)
				}
			</div>
		</div>
	);
});

export type AddNodeMenuProps = {
	onAddPatcherInstance: (patcher: PatcherExportRecord) => void;
	patchers: Seq.Indexed<PatcherExportRecord>;
};

export const AddNodeMenu: FC<AddNodeMenuProps> = memo(function WrappedAddNodeMenu({
	onAddPatcherInstance,
	patchers
}) {

	const dropdownRef = useRef<HTMLDivElement>();
	const theme = useMantineTheme();
	const [maxDropdownMenuHeight, setMaxDropdownMenuHeight] = useState<string>("0px");
	const [addNodeMenuIsOpen, { close: closeMenu, open: openMenu }] = useDisclosure();

	const onTriggerOpen = useCallback(() => {
		if (!dropdownRef.current) return;

		const { bottom } = dropdownRef.current.getBoundingClientRect();
		setMaxDropdownMenuHeight(`calc(${window.innerHeight}px - ${bottom}px - 2 * ${theme.spacing.md}`);
		openMenu();

	}, [setMaxDropdownMenuHeight, openMenu, dropdownRef, theme.spacing.md]);

	return (
		<Menu position="bottom-start" opened={ addNodeMenuIsOpen } onOpen={ onTriggerOpen } onClose={ closeMenu } >
			<Menu.Target ref={ dropdownRef } >
				<Tooltip label="Add Node">
					<ActionIcon variant="default" size="lg">
						<IconElement path={ mdiPlusBox } />
					</ActionIcon>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<div style={{ maxHeight: maxDropdownMenuHeight }}>
					<AddPatcherInstanceMenuSection
						onLoadPatcherInstance={ onAddPatcherInstance }
						patchers={ patchers }
					/>
				</div>
			</Menu.Dropdown>
		</Menu>
	);
});
