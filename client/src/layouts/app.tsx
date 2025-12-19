import React, { PropsWithChildren, useEffect } from "react";
import { AppShell } from "@mantine/core";
import { useTheme } from "../hooks/useTheme";
import { Header } from "../components/header";
import classes from "./app.module.css";
import { useDisclosure } from "@mantine/hooks";
import AppNav from "../components/nav";
import AppStatusWrapper from "../components/page/statusWrapper";
import { Outlet, useLocation } from "react-router";

export const AppLayout: React.FC<PropsWithChildren> = () => {

	const { other } = useTheme();
	const { pathname } = useLocation();
	const [navOpen, { close: closeNav, toggle: toggleNav }] = useDisclosure();

	useEffect(() => {
		return () => closeNav();
	}, [pathname, closeNav]);

	return (
		<AppShell
			header={{ height: other.headerHeight }}
			navbar={{ width: other.navWidth, breakpoint: "sm", collapsed: { mobile: !navOpen } }}
		>
			<Header navOpen={ navOpen } onToggleNav={ toggleNav } />
			<AppNav />
			<AppShell.Main className={ classes.main } >
				<AppStatusWrapper>
					<div className={ classes.wrapper } >
						<Outlet />
					</div>
				</AppStatusWrapper>
			</AppShell.Main>
		</AppShell>
	);
};
