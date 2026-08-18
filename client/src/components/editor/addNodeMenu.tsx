import { FC, memo, useCallback, useMemo, useRef, useState } from "react";
import { PatcherExportRecord } from "../../models/patcher";
import { Seq } from "immutable";
import { ActionIcon, Alert, Anchor, Menu, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { mdiCastAudio, mdiChevronLeft, mdiChevronRight, mdiPlus, mdiPlusBoxOutline } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { groupPatchersByName } from "../../lib/patcherGroups";
import { LinkAudioPeerInfo, LinkAudioSourceRecord } from "../../models/linkAudio";
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
	groupThreshold: number;
	// the category the user has drilled into, or null at the top level
	openGroup: string | null;
	onOpenGroup: (label: string | null) => void;
};

const AddPatcherInstanceMenuSection: FC<AddPatcherInstanceMenuSectionProps> = memo(function WrappedAddPatcherSection({
	onLoadPatcherInstance,
	patchers,
	groupThreshold,
	openGroup,
	onOpenGroup
}) {

	const list = useMemo(() => patchers.toArray(), [patchers]);

	// Only group once the flat list is long enough to be awkward. Categories are sized to the same
	// threshold, so one knob controls both.
	const groups = useMemo(
		() => list.length > groupThreshold ? groupPatchersByName(list, groupThreshold) : null,
		[list, groupThreshold]
	);

	if (!list.length) {
		return (
			<div className={ classes.patcherMenuSection } >
				<Menu.Label>Patchers</Menu.Label>
				<Alert title="No Patcher available" variant="light" color="yellow">
					<Text size="xs">
						Please <Anchor inherit target="_blank" href="https://rnbo.cycling74.com/learn/export-targets-overview">export a RNBO patcher</Anchor> to load on the runner.
					</Text>
				</Alert>
			</div>
		);
	}

	// Flat list, unchanged from before grouping existed.
	if (!groups) {
		return (
			<div className={ classes.patcherMenuSection } >
				<Menu.Label>Patchers</Menu.Label>
				<div className={ classes.patcherMenuSectionList } >
					{ list.map(p => <PatcherMenuEntry key={ p.id } patcher={ p } onLoad={ onLoadPatcherInstance } />) }
				</div>
			</div>
		);
	}

	const current = openGroup === null ? null : groups.find(g => g.label === openGroup);

	// Drill-down rather than hover submenus: this menu is used on the Move's touch screen, where a
	// submenu that opens on hover is close to unusable. closeMenuOnClick={false} keeps the dropdown
	// open while navigating between levels.
	if (current) {
		return (
			<div className={ classes.patcherMenuSection } >
				<Menu.Item
					closeMenuOnClick={ false }
					leftSection={ <IconElement path={ mdiChevronLeft } /> }
					onClick={ () => onOpenGroup(null) }
				>
					All Patchers
				</Menu.Item>
				<Menu.Label>{ current.label }</Menu.Label>
				<div className={ classes.patcherMenuSectionList } >
					{ current.patchers.map(p => <PatcherMenuEntry key={ p.id } patcher={ p } onLoad={ onLoadPatcherInstance } />) }
				</div>
			</div>
		);
	}

	return (
		<div className={ classes.patcherMenuSection } >
			<Menu.Label>Patchers</Menu.Label>
			<div className={ classes.patcherMenuSectionList } >
				{
					groups.map(group => (
						<Menu.Item
							key={ group.label }
							closeMenuOnClick={ false }
							rightSection={ <IconElement path={ mdiChevronRight } /> }
							onClick={ () => onOpenGroup(group.label) }
						>
							{ group.label } <Text span size="xs" c="dimmed" >({ group.patchers.length })</Text>
						</Menu.Item>
					))
				}
			</div>
		</div>
	);
});

type AddLinkMenuSectionProps = {
	peers: LinkAudioPeerInfo[];
	sources: LinkAudioSourceRecord[];
	onAddReceive: (peer: string, channel: string) => void;
	onAddSend: () => void;
};

// Receives already in the graph are left out entirely -- this menu is a list of things you can
// add, so a channel you already have has no row here.
const AddLinkMenuSection: FC<AddLinkMenuSectionProps> = memo(function WrappedAddLinkSection({
	peers,
	sources,
	onAddReceive,
	onAddSend
}) {

	const available = useMemo(() => {
		return peers
			.map(p => ({
				peer: p.peer,
				channels: p.channels.filter(ch => !sources.some(s => s.peer === p.peer && s.channel === ch))
			}))
			.filter(p => p.channels.length);
	}, [peers, sources]);

	return (
		<div className={ classes.patcherMenuSection } >
			<Menu.Label>Link</Menu.Label>
			<div className={ classes.patcherMenuSectionList } >
				{
					available.length ? available.map(p => (
						<div key={ p.peer } >
							<Menu.Label>{ p.peer }</Menu.Label>
							{
								p.channels.map(ch => (
									<Menu.Item
										key={ `${p.peer}/${ch}` }
										leftSection={ <IconElement path={ mdiCastAudio } /> }
										onClick={ () => onAddReceive(p.peer, ch) }
									>
										{ ch }
									</Menu.Item>
								))
							}
						</div>
					)) : (
						<Menu.Item disabled >
							<Text size="xs" c="dimmed" >No Receives available</Text>
						</Menu.Item>
					)
				}
				<Menu.Divider />
				<Menu.Item leftSection={ <IconElement path={ mdiPlus } /> } onClick={ onAddSend } >
					Add Send
				</Menu.Item>
			</div>
		</div>
	);
});

export type AddNodeMenuProps = {
	onAddPatcherInstance: (patcher: PatcherExportRecord) => void;
	patchers: Seq.Indexed<PatcherExportRecord>;
	groupThreshold: number;

	linkAvailable: boolean;
	peers: LinkAudioPeerInfo[];
	sources: LinkAudioSourceRecord[];
	onAddReceive: (peer: string, channel: string) => void;
	onAddSend: () => void;
};

export const AddNodeMenu: FC<AddNodeMenuProps> = memo(function WrappedAddNodeMenu({
	onAddPatcherInstance,
	patchers,
	groupThreshold,
	linkAvailable,
	peers,
	sources,
	onAddReceive,
	onAddSend
}) {

	const dropdownRef = useRef<HTMLDivElement>();
	const theme = useMantineTheme();
	const [maxDropdownMenuHeight, setMaxDropdownMenuHeight] = useState<string>("0px");
	const [addNodeMenuIsOpen, { close: closeMenu, open: openMenu }] = useDisclosure();
	const [openGroup, setOpenGroup] = useState<string | null>(null);

	const onTriggerOpen = useCallback(() => {
		if (!dropdownRef.current) return;

		const { bottom } = dropdownRef.current.getBoundingClientRect();
		setMaxDropdownMenuHeight(`calc(${window.innerHeight}px - ${bottom}px - 2 * ${theme.spacing.md}`);
		openMenu();

	}, [setMaxDropdownMenuHeight, openMenu, dropdownRef, theme.spacing.md]);

	// always reopen at the top level rather than wherever the last drill-down left off
	const onCloseMenu = useCallback(() => {
		setOpenGroup(null);
		closeMenu();
	}, [closeMenu, setOpenGroup]);

	return (
		<Menu position="bottom-end" opened={ addNodeMenuIsOpen } onOpen={ onTriggerOpen } onClose={ onCloseMenu } >
			<Menu.Target ref={ dropdownRef } >
				<Tooltip label="Add Node">
					<ActionIcon variant="default" size="lg">
						<IconElement path={ mdiPlusBoxOutline } />
					</ActionIcon>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<div style={{ maxHeight: maxDropdownMenuHeight }}>
					<AddPatcherInstanceMenuSection
						onLoadPatcherInstance={ onAddPatcherInstance }
						patchers={ patchers }
						groupThreshold={ groupThreshold }
						openGroup={ openGroup }
						onOpenGroup={ setOpenGroup }
					/>
					{
						// hide the whole section rather than show an empty one when
						// jack_transport_link isn't running
						linkAvailable && openGroup === null ? (
							<AddLinkMenuSection
								peers={ peers }
								sources={ sources }
								onAddReceive={ onAddReceive }
								onAddSend={ onAddSend }
							/>
						) : null
					}
				</div>
			</Menu.Dropdown>
		</Menu>
	);
});
