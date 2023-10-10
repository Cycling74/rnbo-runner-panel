import React, { PropsWithChildren, useEffect } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTheme } from "../hooks/useTheme";
import { Header } from "../components/header";
import Navbar from "../components/nav";
import { useRouter } from "next/router";
import classes from "./app.module.css";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {

	const [openNav, { close: closeNav, toggle: toggleNav }] = useDisclosure();
	const { other } = useTheme();
	const { events } = useRouter();

	useEffect(() => {
		events.on("routeChangeStart", closeNav);
		return () => events.off("routeChangeStart", closeNav);
	}, [events, closeNav]);

	return (
		<AppShell
			header={{ height: other.headerHeight }}
			navbar={{ width: other.navWidth, breakpoint: "md", collapsed: { mobile: !openNav } }}
		>
			<Header navOpen={ openNav } onToggleNav={ toggleNav } />
			<Navbar />
			<AppShell.Main className={ classes.main } >
				<div className={ classes.wrapper } >
					{ children }
				</div>
			</AppShell.Main>
		</AppShell>
	);
};
