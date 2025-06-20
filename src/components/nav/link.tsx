import React, { FunctionComponent }  from "react";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { IconElement } from "../elements/icon";
import { Link, useLocation, useMatch } from "react-router";

interface CommonNavLinkProps {
	label: string;
	icon: string;
}

interface NavLinkProps extends CommonNavLinkProps {
	disabled?: boolean;
	pathname: string;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ disabled = false, pathname, icon, label }) => {

	const { search } = useLocation();
	const match = useMatch(pathname);

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }} >
			<UnstyledButton
				disabled={ disabled }
				component={ disabled ? "button" : Link }
				data-active={ !!match }
				to={{ pathname, search }}
				className={ classes.navLink }
			>
				<IconElement path={ icon } />
				<Text ml="sm" hiddenFrom="sm">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};

interface ExternalNavLinkProps extends CommonNavLinkProps {
	href: string;
}

export const ExternalNavLink: FunctionComponent<ExternalNavLinkProps> = ({ href, icon, label }) => {
	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }} >
			<UnstyledButton
				component={ "a" }
				href={ href }
				className={ classes.navLink }
				target="_blank"
				rel="noreferrer noopener"
			>
				<IconElement path={ icon } />
				<Text ml="sm" hiddenFrom="sm">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};
