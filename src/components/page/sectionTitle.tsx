import { FunctionComponent, PropsWithChildren } from "react";
import classes from "./page.module.css";

export type SectionTitleProps = PropsWithChildren;

export const SectionTitle: FunctionComponent<SectionTitleProps> = ({ children }) => (
	<h2 className={ classes.sectionTitle }>{ children }</h2>
);
