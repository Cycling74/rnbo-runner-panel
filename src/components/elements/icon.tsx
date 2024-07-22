import Icon  from "@mdi/react";
import classes from "./elements.module.css";
import { parseThemeColor, useMantineTheme } from "@mantine/core";

export const IconElement: typeof Icon = ({ color, ...props }) => {
	const theme = useMantineTheme();

	let iconColor: string | undefined = undefined;
	if (color) {
		const p = parseThemeColor({ color, theme });
		iconColor = p.isThemeColor ? `var(${p.variable})` : color;
	}

	return (
		<Icon { ...props } className={ classes.icon } color={ iconColor } />
	);
};
