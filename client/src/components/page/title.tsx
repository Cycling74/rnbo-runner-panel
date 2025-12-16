import { FunctionComponent, PropsWithChildren } from "react";
import classes from "./page.module.css";
import { Title } from "@mantine/core";

export type PageTitleProps = PropsWithChildren<{ className?: string; }>;

export const PageTitle: FunctionComponent<PageTitleProps> = ({ className, children }) => (
	<Title className={ [className || "", classes.title].join(" ") }>{ children }</Title>
);
