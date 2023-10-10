import { FunctionComponent, PropsWithChildren } from "react";
import classes from "./page.module.css";

export type PageTitleProps = PropsWithChildren;

export const PageTitle: FunctionComponent<PageTitleProps> = ({ children }) => (
	<h1 className={ classes.title }>{ children }</h1>
);
