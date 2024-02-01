import { AppShell, Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import classes from "./nav.module.css";
import { NavButton } from "./button";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { toggleShowSettings } from "../../actions/settings";
import { faDiagramProject, faGear, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { RootStateType } from "../../lib/store";
import { getShowSettingsModal } from "../../selectors/settings";
import { NavLink } from "./link";
import { useRouter } from "next/router";
import { getFirstPatcherNodeIndex } from "../../selectors/graph";

const AppNav: FunctionComponent = memo(function WrappedNav() {

	const { pathname, query } = useRouter();

	const dispatch = useAppDispatch();
	const onToggleSettings = useCallback(() => dispatch(toggleShowSettings()), [dispatch]);
	const [
		settingsAreShown,
		deviceIndex
	] = useAppSelector((state: RootStateType) => [
		getShowSettingsModal(state),
		getFirstPatcherNodeIndex(state)
	]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { index, ...restQuery } = query; // slurp out potential index query element for a clean query

	return (
		<AppShell.Navbar>
			<Stack className={ classes.navWrapper } >
				<Stack className={ classes.navMenu } >
					<NavLink
						icon={ faDiagramProject }
						label="Graph Editor"
						href={{ pathname: "/", query: restQuery }}
						isActive={ pathname === "/" }
					/>
					<NavLink
						icon={ faVectorSquare }
						label="Device Control"
						href={{ pathname: "/devices/[index]", query: { ...restQuery, index: deviceIndex } }}
						isActive={ pathname === "/devices/[index]" }
					/>
					<NavLink
						icon={ faVectorSquare }
						label="Sets"
						href={{ pathname: "/sets", query: restQuery }}
						isActive={ pathname === "/sets" }
					/>
				</Stack>
				<Stack className={ classes.navMenu } >
					<NavButton onClick={ onToggleSettings } label="Settings" icon={ faGear } isActive={ settingsAreShown } />
				</Stack>
			</Stack>
		</AppShell.Navbar>
	);

});

export default AppNav;
