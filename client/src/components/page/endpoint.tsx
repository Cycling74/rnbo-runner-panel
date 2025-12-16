import { ActionIcon, Alert, Anchor, Button, Fieldset, Grid, Group, Modal, Paper, Popover, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { getAppStatus, getRunnerAPIEndpoint, getShowEndpointInfoModal, getRunnerInfoRecords } from "../../selectors/appStatus";
import { hideEndpointInfo } from "../../actions/appStatus";
import { AppStatus, JackInfoKey, SystemInfoKey } from "../../lib/constants";
import { showSettings } from "../../actions/settings";
import { IconElement } from "../elements/icon";
import { mdiClose, mdiConnection, mdiInformation } from "@mdi/js";
import { RunnerInfoKey } from "../../lib/types";
import { formatFileSize } from "../../lib/util";
import { RunnerInfoRecord } from "../../models/runnerInfo";

type InfoCardProps = {
	title: string;
	description?: string;
	value: string
}

const InfoCard: FunctionComponent<InfoCardProps> = ({
	title,
	description,
	value
}) => {

	return (
		<Paper withBorder radius="sm" p="xs">
			<Group align="center" gap="xs">
				<Text c="dimmed" tt="uppercase" fw="bold" size="xs">
					{ title }
				</Text>
				{
					description?.length ? (
						<Popover withArrow position="bottom">
							<Popover.Target>
								<ActionIcon size="xs" variant="transparent" color="gray">
									<IconElement path={ mdiInformation } />
								</ActionIcon>
							</Popover.Target>
							<Popover.Dropdown>
								<Text size="xs">
									{ description }
								</Text>
							</Popover.Dropdown>
						</Popover>
					) : null
				}
			</Group>
			<Text fw="bold" size="sm" mt="x">
				{ value }
			</Text>
		</Paper>
	);
};

const InfoCardSkeleton: FunctionComponent<Pick<InfoCardProps, "title">> = ({ title }) => (
	<Paper withBorder radius="sm" p="xs">
		<Text c="dimmed" tt="uppercase" fw="bold" size="xs">
			{ title }
		</Text>
		<Skeleton h={ 20 } />
	</Paper>
);

const infoKeyOrder: Partial<Record<RunnerInfoKey, { title: string; format?: (v: RunnerInfoRecord["oscValue"]) => string }>> = {
	[SystemInfoKey.RNBOVersion]: {
		title: "RNBO Version"
	},
	[SystemInfoKey.RunnerVersion]: {
		title: "Runner Version"
	},
	[SystemInfoKey.DiskBytesAvailable]: {
		title: "Available Disk Space",
		format: (value: RunnerInfoRecord["oscValue"]): string => {
			if (typeof value !== "string") return `${value}`;
			const num = parseInt(value, 10);
			if (isNaN(num)) return `${value}`;
			return formatFileSize(parseInt(value, 10));
		}
	},
	[JackInfoKey.XRunCount]: {
		title: "xrun Count"
	},
	[SystemInfoKey.TargetId]: {
		title: "Target Identifier"
	}
};

const EndpointInfo: FunctionComponent = memo(function WrappedSettings() {

	const dispatch = useAppDispatch();
	const [
		doShow,
		appEndpoint,
		appStatus,
		runnerInfoRecords
	] = useAppSelector((state: RootStateType) => [
		getShowEndpointInfoModal(state),
		getRunnerAPIEndpoint(state),
		getAppStatus(state),
		getRunnerInfoRecords(state)
	]);

	const [{ hostname, port }, setEndpoint] = useState<{ hostname: string; port: string; }>({ ...appEndpoint });
	const showFullScreen = useIsMobileDevice();
	const formRef = useRef<HTMLFormElement>();

	const onCloseModal = useCallback(() => dispatch(hideEndpointInfo()), [dispatch]);

	const onReset = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		setEndpoint({ ...appEndpoint });
	}, [appEndpoint, setEndpoint]);

	const onChangeConfig = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setEndpoint({ hostname, port, [e.target.name]: e.target.value });
	}, [hostname, port, setEndpoint]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		window.location.href = `${window.location.protocol}//${window.location.host}?h=${encodeURIComponent(hostname)}&p=${encodeURIComponent(port)}`;
	}, [hostname, port]);

	const openSettings = useCallback(() => {
		dispatch(hideEndpointInfo());
		dispatch(showSettings());
	}, [dispatch]);

	useEffect(() => {
		if (!doShow) {
			setEndpoint({ ...appEndpoint });
		}
	}, [doShow, appEndpoint, setEndpoint]);

	const hasChanges = appEndpoint.hostname !== hostname || appEndpoint.port !== port;

	return (
		<Modal
			onClose={ onCloseModal }
			opened={ doShow }
			fullScreen={ showFullScreen }
			size="lg"
			title="OSCQuery Runner"
		>
			<Stack gap="xl">
				<form onSubmit={ onSubmit } ref={ formRef } >
					<Fieldset legend="Runner Connection Endpoint">
						<Stack gap="md">
							<TextInput
								onChange={ onChangeConfig }
								name="hostname"
								label="Hostname"
								description="The hostname or IP address of the device that runs the OSCQuery Runner"
								value={ hostname }
							/>
							<TextInput
								onChange={ onChangeConfig }
								name="port"
								label="Port"
								inputMode="numeric"
								pattern="[0-9]*"
								description="The port of the OSCQuery Runner Websocket"
								value={ port }
							/>
							<Group justify="flex-end">
								<Button.Group>
									<Button
										variant="default"
										disabled={ !hasChanges }
										onClick={ onReset }
										leftSection={ <IconElement path={ mdiClose } /> }
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={ !hasChanges }
										leftSection={ <IconElement path={ mdiConnection } /> }
									>
										Connect
									</Button>
								</Button.Group>
							</Group>
						</Stack>
					</Fieldset>
				</form>
				<Fieldset legend="Info">
					<Grid grow>
						{
							appStatus === AppStatus.AudioOff ? (
								<Alert variant="light" color="yellow" title="Audio is Off">
									Go to <Anchor inherit onClick={ openSettings } >Settings</Anchor> to update audio configuration.
								</Alert>
							) : null
						}
						{
							Object.entries(infoKeyOrder).map(([key, { format, ...props }]) => {
								const rec = runnerInfoRecords.get(key as RunnerInfoKey);
								return (
									<Grid.Col span={ 6 } key={ key } >
										{
											rec ? (
												<InfoCard { ...props } value={ format ? format(rec.oscValue) : `${rec.oscValue}` } description={ rec.description } />
											) : (
												<InfoCardSkeleton { ...props } />
											)
										}
									</Grid.Col>
								);
							})
						}
					</Grid>
				</Fieldset>
			</Stack>
		</Modal>
	);
});

export default EndpointInfo;
