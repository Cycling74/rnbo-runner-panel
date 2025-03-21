import { ActionIcon, Button, ButtonProps, MantineSize, Tooltip } from "@mantine/core";
import { FC, MouseEvent } from "react";
import { IconElement } from "./icon";

export type ResponsiveButtonProps = {
	color?: ButtonProps["color"];
	className?: string;
	variant?: ButtonProps["variant"];
	label: string;
	icon: string;
	onClick: (e: MouseEvent<HTMLButtonElement>) => any;
	tooltip?: string;
	disabled?: boolean;
	size?: MantineSize;
}

export const ResponsiveButton: FC<ResponsiveButtonProps> = ({
	color,
	className = undefined,
	disabled = false,
	variant = "default",
	label,
	icon,
	onClick,
	size = "sm",
	tooltip
}) => {

	return (
		<>
			<Tooltip label={ tooltip || "" } disabled={ !tooltip?.length }>
				<Button className={ className } visibleFrom="sm"  size={ size } variant={ variant } color={ color } leftSection={ <IconElement path={ icon } /> } onClick={ onClick } disabled={ disabled } >
					{ label }
				</Button>
			</Tooltip>
			<Tooltip label={ tooltip || "" } disabled={ !tooltip?.length }>
				<ActionIcon hiddenFrom="sm" className={ className } variant={ variant } color={ color } onClick={ onClick } size={ 36 } >
					<IconElement path={ icon } />
				</ActionIcon>
			</Tooltip>
		</>
	);
};
