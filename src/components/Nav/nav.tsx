import React, { useState } from "react";
import { NavLink } from "./navLink";
import { NavigationWrapper, NavButton, NavOpen } from "./navStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function Nav() {
	const [showNav, setShowNav] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const handleNavUpdate = () => {
			setShowNav(false);
		};

		router.events.on("routeChangeComplete", handleNavUpdate);

		return () => {
			router.events.off("routeChangeComplete", handleNavUpdate);
		};
	}, [router]);

	const openNav = () => {
		setShowNav(true);
	};

	const closeNav = () => {
		setShowNav(false);
	};
	return (
		<div>
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
					<NavLink href="/parameters" label="PARAMETERS" />
					<NavLink href="/io" label="INPORTS / OUTPORTS" />
					<NavLink href="/midi" label="MIDI CONTROL" />
				</NavOpen>
			</NavigationWrapper>
		</div>
	);
}
