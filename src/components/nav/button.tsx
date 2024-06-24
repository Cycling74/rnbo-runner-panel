import React, { FunctionComponent, MouseEventHandler }  from "react";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./nav.module.css";
import { IconElement } from "../elements/icon";

interface NavLinkProps {
	isActive: boolean;
	label: string;
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: string;
}

export const NavButton: FunctionComponent<NavLinkProps> = ({ isActive, icon, label, onClick }) => {

	return (
		<Tooltip label={ label } position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton
				data-active={ isActive }
				onClick={ onClick }
				className={ classes.navLink }
			>
				<IconElement path={ icon } />
				<Text ml="sm" hiddenFrom="sm">{ label }</Text>
			</UnstyledButton>
		</Tooltip>
	);
};
