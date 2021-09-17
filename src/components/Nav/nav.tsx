import React, { useState } from "react";
import Link from "next/link";
import NavigationWrapper from "./navStyle";
import { useRouter } from 'next/router'



export type NavProps = {};


export default function Nav ({}: NavProps) {
	const [showNav, setShowNav] = useState(false);
	const router = useRouter();
	const currentPath = router.pathname;

	const openNav = () => {
		setShowNav(true);
	}

	const closeNav = () => {
		setShowNav(false);
	}

	return (
		<NavigationWrapper shown={ showNav }>
			<div className="navClosedWrapper">
				<button id="burger" className={`button ${showNav ? "hideNav" : "showNav"}`} onClick={openNav}>&#9776;</button>
			</div>
			<div className={`navOpenWrapper ${showNav ? "showNav" : "hideNav"}`}>
				<button id="close" className="button navClose" onClick={closeNav}>&times;</button>
				<Link href="/parameters">
					<a className={currentPath == "/parameters" ? "active" : ""}>PARAMETERS</a>
				</Link>
				<Link href="/io">
					<a className={currentPath == "/io" ? "active" : ""}>INPORTS / OUTPORTS</a>
				</Link>
				<Link href="/midi">
					<a className={currentPath == "/midi" ? "active" : ""}>MIDI CONTROL</a>
				</Link>
			</div>
		</NavigationWrapper>
	)
}
