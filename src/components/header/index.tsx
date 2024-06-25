import React, { FunctionComponent, memo, useCallback } from "react";
import { ActionIcon, AppShell, Burger, Group, Progress, Tooltip } from "@mantine/core";
import classes from "./header.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { toggleEndpointInfo } from "../../actions/appStatus";
import { toggleTransportControl } from "../../actions/transport";
import { getTransportControlState } from "../../selectors/transport";
import { RootStateType } from "../../lib/store";
import { getAppStatus, getRunnerInfoRecord } from "../../selectors/appStatus";
import { RunnerInfoKey } from "../../models/runnerInfo";
import { AppStatus } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiMetronome, mdiSatelliteUplink } from "@mdi/js";

export type HeaderProps = {
	navOpen: boolean;
	onToggleNav: () => any;
}

export const Header: FunctionComponent<HeaderProps> = memo(function WrappedHeaderComponent({
	navOpen,
	onToggleNav
}) {

	const scheme = useThemeColorScheme();
	const dispatch = useAppDispatch();

	const [
		isRolling,
		cpuLoad
	] = useAppSelector((state: RootStateType) => {
		const status = getAppStatus(state);
		return [
			getTransportControlState(state).rolling,
			status === AppStatus.Ready ? getRunnerInfoRecord(state, RunnerInfoKey.CPULoad) : null
		];
	});


	const onToggleEndpointInfo = useCallback(() => dispatch(toggleEndpointInfo()), [dispatch]);
	const onToggleTransportControl = useCallback(() => dispatch(toggleTransportControl()), [dispatch]);

	return (
		<AppShell.Header>
			<Group className={ classes.headerWrapper } >
				<Group>
					<Burger opened={ navOpen } onClick={ onToggleNav } hiddenFrom="md" size="sm" />
					<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } alt="Cycling '74 Logo" />
				</Group>
				<Group justify="end" align="center" gap="md">
					<Tooltip label="Open Transport Control" >
						<ActionIcon variant="transparent" color={ isRolling ? undefined : "gray" } onClick={ onToggleTransportControl } >
							<IconElement path={ mdiMetronome } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Open Runner Info" >
						<ActionIcon variant="transparent" color="gray" onClick={ onToggleEndpointInfo } >
							<IconElement path={ mdiSatelliteUplink } />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={ `${Math.round(cpuLoad?.oscValue as number || 0)}% CPU Usage`}>
						<Progress value={ cpuLoad?.oscValue as number || 0 } w={ 25 } size="lg" radius="xs" />
					</Tooltip>
				</Group>
			</Group>
		</AppShell.Header>
	);
});
