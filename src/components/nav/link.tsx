import React, { FunctionComponent }  from "react";
import Link from "next/link";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { UrlObject } from "url";

interface NavLinkProps {
	href: string | UrlObject;
	label: string;
	icon: FontAwesomeIconProps["icon"];
	isActive: boolean;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ href, icon, isActive, label }) => {

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton
				component={ Link }
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
