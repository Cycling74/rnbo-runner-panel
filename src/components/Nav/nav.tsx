import React from "react";
import Link from "next/link";
import NavigationWrapper from "./navStyle";


type NavState = {
	showNav?: boolean;
};

class Nav extends React.Component <NavState> {
	state: NavState = {
		showNav: false
	};

	openNav = () => {
		this.setState({
			showNav: true
		})
	}

	closeNav = () => {
		this.setState({
			showNav: false
		})
	}

	render() {

		return (
			<NavigationWrapper shown={ this.state.showNav }>
				<div className="navClosedWrapper">
					<button id="burger" className={`button ${this.state.showNav ? "hideNav" : "showNav"}`} onClick={this.openNav}>&#9776;</button>
				</div>
				<div className={`navOpenWrapper ${this.state.showNav ? "showNav" : "hideNav"}`}>
					<button id="close" className="button navClose" onClick={this.closeNav}>&times;</button>
					<Link href="/parameters">Parameters</Link>
					<Link href="/io">IO</Link>
					<Link href="/midi">MIDI Input</Link>
					<Link href="/buffers">Buffers</Link>
					<Link href="/audio-settings">Audio Settings</Link>
				</div>
			</NavigationWrapper>
		)
	}
}
export default Nav;
