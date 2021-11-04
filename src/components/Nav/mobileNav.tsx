import React, { useState } from "react";
import Link from "next/link";
import { NavLink, NavButton, NavOpen, MobileNavWrapper } from "./navStyle";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Status from "../Status";
import PresetControl from "../PresetControl";
import Title from "../Title";
export default function MobileNav() {
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
		<div>
			<MobileNavWrapper shown={showNav}>
				<div className="mobile-header">
					<div className="header-group">
						<NavButton shown={showNav} onClick={openNav}>
							<FontAwesomeIcon id="menu" icon="bars" />
						</NavButton>
					</div>
					<div className="header-group">
						<Status />
						<PresetControl />
					</div>
				</div>
				<NavOpen shown={showNav}>
					<NavButton shown={showNav} onClick={closeNav}>
						<FontAwesomeIcon id="close" icon="times" />
					</NavButton>
					<Link href="/parameters" passHref>
						<NavLink active={currentPath === "/parameters"}>PARAMETERS</NavLink>
					</Link>
					<Link href="/io" passHref>
						<NavLink active={currentPath === "/io"}>INPORTS / OUTPORTS</NavLink>
					</Link>
					<Link href="/midi" passHref>
						<NavLink active={currentPath === "/midi"}>MIDI CONTROL</NavLink>
					</Link>
				</NavOpen>
			</MobileNavWrapper>
		</div>
	);
}
