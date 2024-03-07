import React, { FunctionComponent, memo, useCallback } from "react";
import { ActionIcon, AppShell, Burger, Group, Tooltip } from "@mantine/core";
import classes from "./header.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";
import { faPlay, faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { toggleEndpointInfo } from "../../actions/appStatus";
import { toggleTransportControl } from "../../actions/transport";
import { getTransportControlState } from "../../selectors/transport";
import { RootStateType } from "../../lib/store";

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

	const [
		isRolling
	] = useAppSelector((state: RootStateType) => [
		getTransportControlState(state).rolling
	]);


	const onToggleEndpointInfo = useCallback(() => dispatch(toggleEndpointInfo()), [dispatch]);
	const onToggleTransportControl = useCallback(() => dispatch(toggleTransportControl()), [dispatch]);

	return (
		<AppShell.Header>
			<Group className={ classes.headerWrapper } >
				<Group>
					<Burger opened={ navOpen } onClick={ onToggleNav } hiddenFrom="md" size="sm" />
					<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } />
				</Group>
				<Group justify="end" align="center" gap="md">
					<Tooltip label="Transport Control" >
						<ActionIcon variant="transparent" color={ isRolling ? undefined : "gray" } onClick={ onToggleTransportControl } >
							<FontAwesomeIcon icon={ faPlay } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Connection Info" >
						<ActionIcon variant="transparent" color="gray" onClick={ onToggleEndpointInfo } >
							<FontAwesomeIcon icon={ faSatelliteDish } />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>
		</AppShell.Header>
	);
});
