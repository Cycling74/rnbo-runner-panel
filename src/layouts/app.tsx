import React, { PropsWithChildren, useEffect } from "react";
import { AppShell } from "@mantine/core";
import { useTheme } from "../hooks/useTheme";
import { Header } from "../components/header";
import classes from "./app.module.css";
import { useDisclosure } from "@mantine/hooks";
import AppNav from "../components/nav";
import { useRouter } from "next/router";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {

	const { other } = useTheme();
	const { events } = useRouter();
	const [navOpen, { close: closeNav, toggle: toggleNav }] = useDisclosure();

	useEffect(() => {
		events.on("routeChangeStart", closeNav);
		return () => events.off("routeChangeStart", closeNav);
	}, [events, closeNav]);

	return (
		<AppShell
			header={{ height: other.headerHeight }}
			navbar={{ width: other.navWidth, breakpoint: "sm", collapsed: { mobile: !navOpen } }}
		>
			<Header navOpen={ navOpen } onToggleNav={ toggleNav } />
			<AppNav />
			<AppShell.Main className={ classes.main } >
				<div className={ classes.wrapper } >
					{ children }
				</div>
			</AppShell.Main>
		</AppShell>
	);
};
