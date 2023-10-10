import React from "react";
import { AppShell, Burger, Group } from "@mantine/core";
import PatcherControl from "./patcherControl";
import Status from "./status";
import classes from "./header.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";

export type HeaderProps = {
	navOpen: boolean;
	onToggleNav: () => any;
}

export const Header = ({ navOpen, onToggleNav }: HeaderProps) => {
	const scheme = useThemeColorScheme();
	return (
		<AppShell.Header>
			<Group className={ classes.headerWrapper } >
				<Group>
					<Burger opened={ navOpen } onClick={ onToggleNav } hiddenFrom="md" size="sm" />
					<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } />
				</Group>
				<Group justify="end" align="center">
					<Status />
					<PatcherControl />
				</Group>
			</Group>
		</AppShell.Header>
	);
};
