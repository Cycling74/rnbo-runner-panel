import React, { FunctionComponent, memo, useCallback } from "react";
import { ActionIcon, AppShell, Group } from "@mantine/core";
import Status from "./status";
import classes from "./header.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { toggleShowSettings } from "../../actions/settings";

export const Header: FunctionComponent = memo(function WrappedHeaderComponent() {

	const dispatch = useAppDispatch();
	const scheme = useThemeColorScheme();
	const onToggleSettings = useCallback(() => dispatch(toggleShowSettings()), [dispatch]);

	return (
		<AppShell.Header>
			<Group className={ classes.headerWrapper } >
				<Group>
					<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } />
				</Group>
				<Group justify="end" align="center">
					<Status />
					<ActionIcon variant="default" onClick={ onToggleSettings } >
						<FontAwesomeIcon icon={ faGear } />
					</ActionIcon>
				</Group>
			</Group>
		</AppShell.Header>
	);
});
