import React, { useState } from "react";
import { NavLink } from "./navLink";
import { NavSidebar, NavContainer, NavControl } from "./navStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Nav = () => {
	const [showNav, setShowNav] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const handleNavUpdate = () => { setShowNav(false); };
		router.events.on("routeChangeComplete", handleNavUpdate);

		return () => {
			router.events.off("routeChangeComplete", handleNavUpdate);
		};
	}, [router]);

	return (
		<>
			<NavSidebar>
				<NavControl onClick={() => setShowNav(true)} darkOnMobile={true}>
					<FontAwesomeIcon icon="bars" />
				</NavControl>
			</NavSidebar>

			<NavContainer visible={showNav}>
				<NavControl onClick={() => setShowNav(false)}>
					<FontAwesomeIcon icon="times" />
				</NavControl>
				<NavLink href="/parameters" label="PARAMETERS" />
				<NavLink href="/io" label="INPORTS / OUTPORTS" />
				<NavLink href="/midi" label="MIDI CONTROL" />
			</NavContainer>
		</>
	);
};

export default Nav;
