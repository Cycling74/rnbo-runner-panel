import React, { FunctionComponent }  from "react";
import Link from "next/link";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { UrlObject } from "url";

interface NavLinkProps {
	disabled?: boolean;
	href: string | UrlObject;
	label: string;
	icon: FontAwesomeIconProps["icon"];
	isActive: boolean;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ disabled = false, href, icon, isActive, label }) => {

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }}>
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
