import React, { FunctionComponent }  from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

interface NavLinkProps {
	href: string;
	label: string;
	icon: FontAwesomeIconProps["icon"];
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ href, icon, label }) => {
	const { pathname, query } = useRouter();

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton
				component={ Link }
				data-active={ pathname === href }
				href={ { pathname: href, query } }
				className={ classes.navLink }
			>
				<FontAwesomeIcon icon={ icon } />
				<Text ml="sm" hiddenFrom="md">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};
