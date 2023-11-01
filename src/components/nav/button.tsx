import React, { FunctionComponent, MouseEventHandler }  from "react";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

interface NavLinkProps {
	isActive: boolean;
	label: string;
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: FontAwesomeIconProps["icon"];
}

export const NavButton: FunctionComponent<NavLinkProps> = ({ isActive, icon, label, onClick }) => {

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton
				data-active={ isActive }
				onClick={ onClick }
				className={ classes.navLink }
			>
				<FontAwesomeIcon icon={ icon } />
				<Text ml="sm" hiddenFrom="md">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};
