import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PatcherExportRecord } from "../../models/patcher";
import { Seq } from "immutable";
import { ActionIcon, Alert, Anchor, Menu, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { mdiCastAudio, mdiCheck, mdiChevronLeft, mdiChevronRight, mdiPlus, mdiPlusBoxOutline } from "@mdi/js";
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
			<div className={ classes.menuSection } >
				<Menu.Label className={ classes.sectionLabel } >Patchers</Menu.Label>
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
			<div className={ classes.menuSection } >
				<Menu.Label className={ classes.sectionLabel } >Patchers</Menu.Label>
				<div className={ classes.menuSectionList } >
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
			<div className={ classes.menuSection } >
				<Menu.Item
					closeMenuOnClick={ false }
					leftSection={ <IconElement path={ mdiChevronLeft } /> }
					onClick={ () => onOpenGroup(null) }
				>
					All Patchers
				</Menu.Item>
				<Menu.Label className={ classes.sectionLabel } >{ current.label }</Menu.Label>
				<div className={ classes.menuSectionList } >
					{ current.patchers.map(p => <PatcherMenuEntry key={ p.id } patcher={ p } onLoad={ onLoadPatcherInstance } />) }
				</div>
			</div>
		);
	}

	return (
		<div className={ classes.menuSection } >
			<Menu.Label className={ classes.sectionLabel } >Patchers</Menu.Label>
			<div className={ classes.menuSectionList } >
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
	// the peer the user has drilled into, or null at the top level
	openPeer: string | null;
	onOpenPeer: (peer: string | null) => void;
	onAddReceive: (peer: string, channel: string) => void;
	onAddSend: () => void;
};

// A channel already in the graph keeps its row, disabled and check-marked. Hiding them made the
// peer's channel list change shape as you added to it, and left no way to tell "already have it"
// apart from "the peer stopped advertising it".
const AddLinkMenuSection: FC<AddLinkMenuSectionProps> = memo(function WrappedAddLinkSection({
	peers,
	sources,
	openPeer,
	onOpenPeer,
	onAddReceive,
	onAddSend
}) {

	const available = useMemo(() => {
		return peers.map(p => ({
			peer: p.peer,
			channels: p.channels.map(ch => ({
				channel: ch,
				added: sources.some(s => s.peer === p.peer && s.channel === ch)
			}))
		}));
	}, [peers, sources]);

	// A peer that went away while drilled into it drops us back to the peer list rather than showing
	// an empty page.
	const current = openPeer === null ? null : available.find(p => p.peer === openPeer);

	// Same drill-down as the patcher categories: one peer at a time, so a peer with many channels
	// can't push the rest of the menu off the screen.
	if (current) {
		return (
			<div className={ classes.menuSection } >
				<Menu.Item
					closeMenuOnClick={ false }
					leftSection={ <IconElement path={ mdiChevronLeft } /> }
					onClick={ () => onOpenPeer(null) }
				>
					All Peers
				</Menu.Item>
				<Menu.Label className={ classes.sectionLabel } >{ current.peer }</Menu.Label>
				<div className={ classes.menuSectionList } >
					{
						current.channels.map(({ channel, added }) => (
							<Menu.Item
								key={ channel }
								disabled={ added }
								leftSection={ <IconElement path={ mdiCastAudio } /> }
								rightSection={ added ? <IconElement path={ mdiCheck } /> : undefined }
								onClick={ () => onAddReceive(current.peer, channel) }
							>
								{ channel }
							</Menu.Item>
						))
					}
				</div>
			</div>
		);
	}

	return (
		<div className={ classes.menuSection } >
			<Menu.Label className={ classes.sectionLabel } >Link</Menu.Label>
			<div className={ classes.menuSectionList } >
				{
					available.length ? available.map(p => (
						<Menu.Item
							key={ p.peer }
							closeMenuOnClick={ false }
							rightSection={ <IconElement path={ mdiChevronRight } /> }
							onClick={ () => onOpenPeer(p.peer) }
						>
							{ p.peer }
							{ " " }
							<Text span size="xs" c="dimmed" >
								{
									// how many are still addable, since the rest are only there to be seen
									p.channels.every(ch => ch.added)
										? "(all added)"
										: `(${p.channels.filter(ch => !ch.added).length} of ${p.channels.length})`
								}
							</Text>
						</Menu.Item>
					)) : (
						<div className={ classes.sectionEmpty } >
							<Text size="xs" c="dimmed" >No peers advertising channels</Text>
						</div>
					)
				}
				<Menu.Item leftSection={ <IconElement path={ mdiPlus } /> } onClick={ onAddSend } >
					Add Send
				</Menu.Item>
			</div>
		</div>
	);
});

// Which section the open drill-down belongs to, plus the category or peer name within it.
type OpenGroup = { section: "patchers" | "link"; label: string };

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

	// Both sections drill down into the same single slot: whatever the user opened is the only thing
	// on screen, and the sections it came from replace the whole menu contents.
	const [openGroup, setOpenGroup] = useState<OpenGroup | null>(null);

	const onOpenPatcherGroup = useCallback((label: string | null) => {
		setOpenGroup(label === null ? null : { section: "patchers", label });
	}, [setOpenGroup]);

	const onOpenPeer = useCallback((peer: string | null) => {
		setOpenGroup(peer === null ? null : { section: "link", label: peer });
	}, [setOpenGroup]);

	// Fit the dropdown between the trigger and the bottom of the screen. visualViewport is the area
	// actually visible on a phone -- it accounts for the browser chrome and an on-screen keyboard,
	// which innerHeight does not.
	const measureMaxHeight = useCallback(() => {
		if (!dropdownRef.current) return;

		const { bottom } = dropdownRef.current.getBoundingClientRect();
		const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
		setMaxDropdownMenuHeight(`calc(${viewportHeight}px - ${bottom}px - 2 * ${theme.spacing.md})`);
	}, [setMaxDropdownMenuHeight, dropdownRef, theme.spacing.md]);

	const onTriggerOpen = useCallback(() => {
		measureMaxHeight();
		openMenu();
	}, [measureMaxHeight, openMenu]);

	// the mobile browser chrome collapsing, a rotation or an on-screen keyboard all change the
	// available height while the menu is open
	useEffect(() => {
		if (!addNodeMenuIsOpen) return () => {};

		const viewport = window.visualViewport;
		viewport?.addEventListener("resize", measureMaxHeight);
		window.addEventListener("resize", measureMaxHeight);
		return () => {
			viewport?.removeEventListener("resize", measureMaxHeight);
			window.removeEventListener("resize", measureMaxHeight);
		};
	}, [addNodeMenuIsOpen, measureMaxHeight]);

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
				<div className={ classes.menuScroll } style={{ maxHeight: maxDropdownMenuHeight }}>
					{
						openGroup === null || openGroup.section === "patchers" ? (
							<AddPatcherInstanceMenuSection
								onLoadPatcherInstance={ onAddPatcherInstance }
								patchers={ patchers }
								groupThreshold={ groupThreshold }
								openGroup={ openGroup === null ? null : openGroup.label }
								onOpenGroup={ onOpenPatcherGroup }
							/>
						) : null
					}
					{
						// hide the whole section rather than show an empty one when
						// jack_transport_link isn't running
						linkAvailable && (openGroup === null || openGroup.section === "link") ? (
							<AddLinkMenuSection
								peers={ peers }
								sources={ sources }
								openPeer={ openGroup === null ? null : openGroup.label }
								onOpenPeer={ onOpenPeer }
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
