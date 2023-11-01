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

	return (
		<AppShell.Navbar>
			<Stack className={ classes.navWrapper } >
				<Stack className={ classes.navMenu } >
					<NavLink
						icon={ faDiagramProject }
						label="Graph Editor"
						href={{ pathname: "/", query }}
						isActive={ pathname === "/" }
					/>
					<NavLink
						icon={ faVectorSquare }
						label="Device Control"
						href={{ pathname: "/devices/[index]", query: { ...query, index: deviceIndex } }}
						isActive={ pathname === "/devices/[index]" }
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
