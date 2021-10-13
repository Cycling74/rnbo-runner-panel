import React, { useState } from "react";
import Link from "next/link";
import { NavigationWrapper, NavLink } from "./navStyle";
import { useRouter } from "next/router";

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

	return (
		<NavigationWrapper shown={ showNav }>
			<div className="navClosedWrapper">
				<button id="burger" className={`button ${showNav ? "hideNav" : "showNav"}`} onClick={openNav}>&#9776;</button>
			</div>
			<div className={`navOpenWrapper ${showNav ? "showNav" : "hideNav"}`}>
				<button id="close" className="button navClose" onClick={closeNav}>&times;</button>
				<Link href="/parameters">
					<NavLink active={currentPath === "/parameters" ? true : false}>PARAMETERS</NavLink>
				</Link>
				<Link href="/io">
					<NavLink active={currentPath === "/io" ? true : false}>INPORTS / OUTPORTS</NavLink>
				</Link>
				<Link href="/midi">
					<NavLink active={currentPath === "/midi" ? true : false}>MIDI CONTROL</NavLink>
				</Link>
			</div>
		</NavigationWrapper>
	);
}
