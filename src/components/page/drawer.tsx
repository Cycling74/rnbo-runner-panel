import { PropsWithChildren } from "react";
import classes from "./page.module.css";

export const DrawerSectionTitle = ({ children }: PropsWithChildren) => {
	return (
		<h3 className={ classes.drawerSectionTitle } >{ children }</h3>
	);
};
