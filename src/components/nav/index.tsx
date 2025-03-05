import { AppShell, Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import classes from "./nav.module.css";
import { NavButton } from "./button";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { toggleShowSettings } from "../../actions/settings";
import { RootStateType } from "../../lib/store";
import { getShowSettingsModal } from "../../selectors/settings";
import { ExternalNavLink, NavLink } from "./link";
import { useRouter } from "next/router";
import { getFirstPatcherNodeId } from "../../selectors/graph";
import { mdiChartSankeyVariant, mdiCog, mdiFileMusic, mdiHelpCircle, mdiMidiPort, mdiVectorSquare, mdiTableEye, mdiFileExport } from "@mdi/js";

const AppNav: FunctionComponent = memo(function WrappedNav() {

	const { pathname, query } = useRouter();

	const dispatch = useAppDispatch();
	const onToggleSettings = useCallback(() => dispatch(toggleShowSettings()), [dispatch]);
	const [
		settingsAreShown,
		instanceId
	] = useAppSelector((state: RootStateType) => [
		getShowSettingsModal(state),
		getFirstPatcherNodeId(state)
	]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { id, ...restQuery } = query; // slurp out potential id query element for a clean query

	return (
		<AppShell.Navbar>
			<Stack className={ classes.navWrapper } >
				<Stack className={ classes.navMenu } >
					<NavLink
						icon={ mdiChartSankeyVariant }
						label="Graph Editor"
						href={{ pathname: "/", query: restQuery }}
						isActive={ pathname === "/" }
					/>
					<NavLink
						disabled={ instanceId === undefined }
						icon={ mdiVectorSquare }
						label="Patcher Instance Control"
						href={{ pathname: "/instances/[id]", query: { ...restQuery, id: instanceId } }}
						isActive={ pathname === "/instances/[id]" }
					/>
					<NavLink
						icon={ mdiFileExport }
						label="Patchers"
						href={{ pathname: "/patchers", query: restQuery }}
						isActive={ pathname === "/patchers" }
					/>
					<NavLink
						icon={ mdiFileMusic }
						label="Audio Files"
						href={{ pathname: "/files", query: restQuery }}
						isActive={ pathname === "/files" }
					/>
					<NavLink
						icon={ mdiTableEye }
						label="SetViews"
						href={{ pathname: "/setviews", query: { ...restQuery } }}
						isActive={ pathname === "/setviews" }
					/>
					<NavLink
						icon={ mdiMidiPort }
						label="MIDI Mappings"
						href={{ pathname: "/midimappings", query: restQuery }}
						isActive={ pathname === "/midimappings" }
					/>
				</Stack>
				<Stack className={ classes.navMenu } >
					<ExternalNavLink
						icon={ mdiHelpCircle }
						label="Help & Documentation"
						href="https://rnbo.cycling74.com/learn/raspberry-pi-web-interface-guide"
					/>
					<NavButton onClick={ onToggleSettings } label="Settings" icon={ mdiCog } isActive={ settingsAreShown } />
				</Stack>
			</Stack>
		</AppShell.Navbar>
	);

});

export default AppNav;
