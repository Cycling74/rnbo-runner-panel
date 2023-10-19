import React, { PropsWithChildren } from "react";
import { AppShell } from "@mantine/core";
import { useTheme } from "../hooks/useTheme";
import { Header } from "../components/header";
import classes from "./app.module.css";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {

	const { other } = useTheme();

	return (
		<AppShell header={{ height: other.headerHeight }} >
			<Header />
			<AppShell.Main className={ classes.main } >
				<div className={ classes.wrapper } >
					{ children }
				</div>
			</AppShell.Main>
		</AppShell>
	);
};
