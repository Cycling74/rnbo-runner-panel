import React, { useState } from "react";
import Link from "next/link";
import { NavigationWrapper, NavLink, NavButton, NavOpen } from "./navStyle";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Nav() {
	const [showNav, setShowNav] = useState(false);
	const router = useRouter();
	const currentPath = router.pathname;

	const openNav = () => {
		setShowNav(true);
	};

	const closeNav = () => {
		setShowNav(false);
	};
	console.log(showNav);
	return (
		<NavigationWrapper shown={ showNav }>
			<div>
				<NavButton shown={ showNav } onClick={openNav}>
					<FontAwesomeIcon id="menu" icon="bars" />
				</NavButton>
			</div>
			<NavOpen shown={ showNav }>
				<NavButton shown={ showNav } onClick={closeNav}>
					<FontAwesomeIcon id="close" icon="times" />
				</NavButton>
				<Link href="/parameters" passHref>
					<NavLink active={currentPath === "/parameters" ? true : false}>PARAMETERS</NavLink>
				</Link>
				<Link href="/io" passHref>
					<NavLink active={currentPath === "/io" ? true : false}>INPORTS / OUTPORTS</NavLink>
				</Link>
				<Link href="/midi" passHref>
					<NavLink active={currentPath === "/midi" ? true : false}>MIDI CONTROL</NavLink>
				</Link>
			</NavOpen>
		</NavigationWrapper>
	);
}
