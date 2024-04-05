import React, { FunctionComponent }  from "react";
import Link from "next/link";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { UrlObject } from "url";

interface CommonNavLinkProps {
	disabled?: boolean;
	label: string;
	icon: FontAwesomeIconProps["icon"];
}

interface NavLinkProps extends CommonNavLinkProps {
	isActive: boolean;
	href: string | UrlObject;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ disabled = false, href, icon, isActive, label }) => {
	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }} >
			<UnstyledButton
				disabled={ disabled }
				component={ disabled ? "button" : Link }
				data-active={ isActive }
				href={ href }
				className={ classes.navLink }
			>
				<FontAwesomeIcon icon={ icon } />
				<Text ml="sm" hiddenFrom="sm">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};

interface ExternalNavLinkProps extends CommonNavLinkProps {
	href: string;
}

export const ExternalNavLink: FunctionComponent<ExternalNavLinkProps> = ({ disabled = false, href, icon, label }) => {
	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }} >
			<UnstyledButton
				disabled={ disabled }
				component={ disabled ? "button" : "a" }
				href={ href }
				className={ classes.navLink }
				target="_blank"
				rel="noreferrer noopener"
			>
				<FontAwesomeIcon icon={ icon } />
				<Text ml="sm" hiddenFrom="sm">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};
