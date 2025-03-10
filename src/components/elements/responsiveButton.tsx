import { ActionIcon, Button, ButtonProps, Tooltip } from "@mantine/core";
import { FC, MouseEvent } from "react";
import { IconElement } from "./icon";

export type ResponsiveButtonProps = {
	color?: ButtonProps["color"];
	variant?: ButtonProps["variant"];
	label: string;
	icon: string;
	onClick: (e: MouseEvent<HTMLButtonElement>) => any;
	tooltip?: string;
	disabled?: boolean;
}

export const ResponsiveButton: FC<ResponsiveButtonProps> = ({
	color,
	disabled = false,
	variant = "default",
	label,
	icon,
	onClick,
	tooltip
}) => {

	return (
		<>
			<Tooltip label={ tooltip || "" } disabled={ !tooltip?.length }>
				<Button visibleFrom="sm" variant={ variant } color={ color } leftSection={ <IconElement path={ icon } /> } onClick={ onClick } disabled={ disabled } >
					{ label }
				</Button>
			</Tooltip>
			<Tooltip label={ tooltip || "" } disabled={ !tooltip?.length }>
				<ActionIcon hiddenFrom="sm" variant={ variant } color={ color } onClick={ onClick } size="lg">
					<IconElement path={ icon } />
				</ActionIcon>
			</Tooltip>
		</>
	);
};
