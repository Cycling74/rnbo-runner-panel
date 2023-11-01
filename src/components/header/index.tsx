import React, { FunctionComponent, memo } from "react";
import { ActionIcon, AppShell, Burger, Group } from "@mantine/core";
import classes from "./header.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { toggleEndpointInfo } from "../../actions/appStatus";

export type HeaderProps = {
	navOpen: boolean;
	onToggleNav: () => any;
}

export const Header: FunctionComponent<HeaderProps> = memo(function WrappedHeaderComponent({
	navOpen,
	onToggleNav
}) {

	const scheme = useThemeColorScheme();
	const dispatch = useAppDispatch();
	const onToggleEndpointInfo = () => dispatch(toggleEndpointInfo());

	return (
		<AppShell.Header>
			<Group className={ classes.headerWrapper } >
				<Group>
					<Burger opened={ navOpen } onClick={ onToggleNav } hiddenFrom="md" size="sm" />
					<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } />
				</Group>
				<Group justify="end" align="center">
					<ActionIcon variant="outline" color="gray" onClick={ onToggleEndpointInfo } >
						<FontAwesomeIcon icon={ faSatelliteDish } />
					</ActionIcon>
				</Group>
			</Group>
		</AppShell.Header>
	);
});
