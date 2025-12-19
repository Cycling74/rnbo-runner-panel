import Icon  from "@mdi/react";
import classes from "./elements.module.css";
import { parseThemeColor, useMantineTheme } from "@mantine/core";
import { forwardRef, RefObject } from "react";
import { IconProps } from "@mdi/react/dist/IconProps";

export const IconElement = forwardRef<SVGSVGElement, IconProps>(function WrappedIconElement({ color, ...props }, ref) {
	const theme = useMantineTheme();

	let iconColor: string | undefined = undefined;
	if (color) {
		const p = parseThemeColor({ color, theme });
		iconColor = p.isThemeColor ? `var(${p.variable})` : color;
	}

	return (
		<Icon { ...props } className={ classes.icon } color={ iconColor } ref={ ref as RefObject<SVGSVGElement> } />
	);
});
