import React from "react";
import { NavLink } from "./navLink";
import { AppShell, Stack } from "@mantine/core";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRightArrowLeft, faGears, faMusic, faSliders } from "@fortawesome/free-solid-svg-icons";
import classes from "./nav.module.css";

const topLinks: Array<{ icon: IconDefinition; label: string; href: string; }> = [
	{ icon: faSliders, label: "Parameters", href: "/parameters" },
	{ icon: faArrowRightArrowLeft, label: "Inport & Outports", href: "/io" },
	{ icon: faMusic, label: "MIDI Control", href: "/midi" }
];

const bottomLinks: Array<{ icon: IconDefinition; label: string; href: string; }> = [
	{ icon: faGears, label: "Settings", href: "/settings" }
];

const Navbar = () => {
	return (
		<AppShell.Navbar>
			<Stack className={ classes.navWrapper } >
				<Stack className={ classes.navMenu } >
					{
						topLinks.map((props) => <NavLink key={ props.href } { ...props } />)
					}
				</Stack>
				<Stack className={ classes.navMenu } >
					{
						bottomLinks.map((props) => <NavLink key={ props.href } { ...props } />)
					}
				</Stack>
			</Stack>
		</AppShell.Navbar>
	);
};

export default Navbar;
