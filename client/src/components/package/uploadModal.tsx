import { Alert, Badge, Button, Center, Fieldset, Group, Modal, Paper, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, FormEvent, memo, ReactNode, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { FileWithPath } from "@mantine/dropzone";
import { IconElement } from "../elements/icon";
import { mdiClose, mdiEqual, mdiFileExport, mdiFileMusic, mdiGroup, mdiInformationOutline, mdiLoading, mdiPackageUp, mdiPlus, mdiReloadAlert, mdiUpload } from "@mdi/js";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { ResourceType, SystemInfoKey } from "../../lib/constants";
import { FileDropZone } from "../page/fileDropZone";
import { getRunnerInfoRecord, getRunnerOrigin } from "../../selectors/appStatus";
import { PackageInfoRecord } from "../../models/packageInfo";
import { getPackageUploadStatus, PackageUploadStatus, PackageItemUploadStatus, readInfoFromPackageFile } from "../../lib/package";
import { getDataFiles } from "../../selectors/datafiles";
import { getPatcherExports } from "../../selectors/patchers";
import { getGraphSets } from "../../selectors/sets";
import { installPackageOnRunner } from "../../controller/cmd";
import { uploadFileToRemote } from "../../lib/files";
import { RunnerFileType } from "../../lib/constants";

const PACKAGE_EXTENSION: string = "rnbopack";

export type UploadFile = {
	id: string;
	file: FileWithPath;
	progress: number;
	error?: Error;
}

type PackageContentItemProps = {
	status?: PackageItemUploadStatus;
	resourceType: ResourceType;
	title: string;
};

const resourceStatusBadge: Record<PackageItemUploadStatus, ReactNode> = {
	[PackageItemUploadStatus.Install]: (
		<Badge leftSection={<IconElement path={mdiPlus} />} variant="light" size="sm" color="green">New</Badge>
	),
	[PackageItemUploadStatus.Skip]: (
		<Badge leftSection={<IconElement path={mdiEqual} />} variant="light" size="sm" color="gray">Skip</Badge>
	),
	[PackageItemUploadStatus.Overwrite]: (
		<Badge leftSection={<IconElement path={mdiReloadAlert} />} variant="light" size="sm" color="yellow">Overwrite</Badge>
	)
};

const resourceTypeTitle: Record<ResourceType, string> = {
	[ResourceType.DataFile]: "Data File",
	[ResourceType.Patcher]: "Patcher",
	[ResourceType.Set]: "Graph"
};

const resourceTypeDisplay: Record<ResourceType, ReactNode> = {
	[ResourceType.DataFile]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiFileMusic } />
			<span>{ resourceTypeTitle[ResourceType.DataFile] }</span>
		</Group>
	),
	[ResourceType.Patcher]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiFileExport } />
			<span>{ resourceTypeTitle[ResourceType.Patcher] }</span>
		</Group>
	),
	[ResourceType.Set]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiGroup } />
			<span>{ resourceTypeTitle[ResourceType.Set] }</span>
		</Group>
	)
};

type InfoCardProps = {
	title: string;
	value: string;
	error?: string;
}

const InfoCard: FC<InfoCardProps> = ({
	title,
	value,
	error
}) => {

	return (
		<Paper withBorder radius="sm" p="xs" style={{ borderColor: error ? "red" : null }}>
			<Group align="center" gap="xs">
				<Text c="dimmed" tt="uppercase" fw="bold" size="xs">
					{ title }
				</Text>
			</Group>
			<Text fw="bold" size="sm" mt="x">
				{ value }
			</Text>

			{
				error ? (
					<Text c="red" fz="xs" component="div" >
						{ error }
					</Text>
				) : null
			}
		</Paper>
	);
};

const PackageContentItem: FC<PackageContentItemProps> = ({
	status,
	resourceType,
	title
}) => {

	return (
		<Table.Tr>
			<Table.Td valign="top" >{ resourceStatusBadge[status] }</Table.Td>
			<Table.Td valign="top" >{ resourceTypeDisplay[resourceType] }</Table.Td>
			<Table.Td valign="top" >
				{ title }
			</Table.Td>
		</Table.Tr>
	);
};

type StatusCounts = Record<PackageItemUploadStatus, number>;

type PackageUploadSummaryProps = {
	counts: StatusCounts;
};

const PackageUploadSummary: FC<PackageUploadSummaryProps> = ({
	counts
}) => {

	return (
		<Stack gap="sm">
			<Group grow>
				{
					[
						{
							statusField: PackageItemUploadStatus.Install,
							props: { color: "green", title: "New" }
						},
						{
							statusField: PackageItemUploadStatus.Skip,
							props: { color: "gray", title: "Skip" }
						},
						{
							statusField: PackageItemUploadStatus.Overwrite,
							props: { color: "yellow", title: "Will Overwrite" }
						}
					].map(({ statusField, props } ) => counts[statusField] === 0 ? null : (
						<Alert { ...props } key={ statusField } p="xs" variant="light">
							<Text fz="lg" fw="bold" c={ props.color } >{ counts[statusField] }</Text>
						</Alert>
					))
				}
			</Group>
		</Stack >
	);
};

type PackageUploadConfirmFormProps = {
	status: PackageUploadStatus;
	info: PackageInfoRecord;
	onCancel: () => void;
	onSubmit: () => void;
	supportsRNBOVersion: boolean;
	supportsTarget: boolean;
};

const PackageUploadConfirmForm: FC<PackageUploadConfirmFormProps> = ({
	status,
	info,
	onCancel,
	onSubmit,
	supportsRNBOVersion,
	supportsTarget
}) => {

	const onTriggerSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit();
	}, [onSubmit]);

	const [
		supportsUpload,
		rnboVersion,
		rnboCompatVersion
	] = useAppSelector((state) => [
		supportsRNBOVersion && supportsTarget,
		getRunnerInfoRecord(state, SystemInfoKey.RNBOVersion),
		getRunnerInfoRecord(state, SystemInfoKey.RNBOCompatVersion)
	]);

	const statusCounts: Record<PackageItemUploadStatus, number> = {
		[PackageItemUploadStatus.Install]: 0,
		[PackageItemUploadStatus.Skip]: 0,
		[PackageItemUploadStatus.Overwrite]: 0
	};

	info.datafiles.forEach(df => {
		const itemStatus = status.datafiles.get(df.name);
		statusCounts[itemStatus]++;
	});

	info.patchers.forEach(p => {
		const itemStatus = status.patchers.get(p.name);
		statusCounts[itemStatus]++;
	});

	info.sets.forEach(s => {
		const itemStatus = status.sets.get(s.name);
		statusCounts[itemStatus]++;
	});

	return (
		<form onSubmit={ onTriggerSubmit } >
			<Stack gap="lg">
				<Fieldset legend="Runner" >
					<Stack gap="md">
						<InfoCard title="Package Name" value={ info.name } />
						<Group grow align="flex-start">
							<InfoCard
								title={ rnboCompatVersion ? "RNBO Compatibility Version" : "RNBO Version" }
								value={ info.rnbo_version }
								error={ !supportsRNBOVersion ? `The package does not match the runner's RNBO Compatibility version: ${(rnboCompatVersion || rnboVersion).oscValue}` : undefined }
							/>
							<InfoCard
								title="Runner Version"
								value={ info.runner_version }
							/>
						</Group>
						<InfoCard
							title="Supported Targets"
							error={ !supportsTarget ? "The package does not support the runner's target id" : undefined }
							value={ info.targets.keySeq().toArray().join("\n") }
						/>
					</Stack>
				</Fieldset>
				{
					statusCounts[PackageItemUploadStatus.Overwrite] !== 0 ? (
						<Alert color="yellow" variant="outline" title="Package includes Overwrites" icon={<IconElement path={mdiInformationOutline} />} >
							{statusCounts[PackageItemUploadStatus.Overwrite]} existing {statusCounts[PackageItemUploadStatus.Overwrite] === 1 ? "resource" : "resources"} will be replaced.
							<br/>
							Review the details below before continuing. This action cannot be undone.
						</Alert>
					) : null
				}
				<Fieldset legend="Contents" >
					<Stack gap="md">
						<PackageUploadSummary counts={statusCounts } />
						<Table verticalSpacing="xs" horizontalSpacing="xs" >
							<Table.Thead>
								<Table.Tr>
									<TableHeaderCell width={ 120 } >Status</TableHeaderCell>
									<TableHeaderCell width={ 150 } >Type</TableHeaderCell>
									<TableHeaderCell>Name</TableHeaderCell>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{
									info.datafiles.map(df => (
										<PackageContentItem
											key={ `df_${df.id}`}
											status={ status.datafiles.get(df.name) }
											resourceType={ ResourceType.DataFile }
											title={ df.name }
										/>
									))
								}
								{
									info.patchers.map(patcher => (
										<PackageContentItem
											key={ `patcher_${patcher.id}`}
											status={ status.patchers.get(patcher.name) }
											resourceType={ ResourceType.Patcher }
											title={ patcher.name }
										/>
									))
								}
								{
									info.sets.map(set => (
										<PackageContentItem
											key={ `set${set.id}`}
											status={ status.sets.get(set.name) }
											resourceType={ ResourceType.Set }
											title={ set.name }
										/>
									))
								}
							</Table.Tbody>
						</Table>
					</Stack>
				</Fieldset>
				{
					!supportsUpload ? (
						<Alert variant="light" color="red">
							The runner does not support the selected package.
						</Alert>
					) : null
				}
				<Group justify="flex-end">
					<Button.Group>
						<Button
							variant="light"
							color="gray"
							onClick={ onCancel }
							leftSection={ <IconElement path={ mdiClose } /> }
						>
							Cancel
						</Button>
						<Button
							type="submit"
							leftSection={ <IconElement path={ mdiUpload } /> }
							disabled={ !supportsUpload }
						>
							Upload
						</Button>
					</Button.Group>
				</Group>
			</Stack>
		</form>
	);
};

export type PackageUploadModalProps = {
	onClose: () => any;
};

enum PackageUploadStep {
	Select,
	Confirm,
	Uploading,
	Installing,
	Complete,
	Error
}

interface PackageUploadSelectState {
	step: PackageUploadStep.Select;
}

interface PackageUploadConfirmState {
	step: PackageUploadStep.Confirm;
	status: PackageUploadStatus;
	pkgInfo: PackageInfoRecord;
	file: File;
}

interface PackageUploadUploadingState {
	step: PackageUploadStep.Uploading;
	progress: number;
}

interface PackageUploadInstallingState {
	step: PackageUploadStep.Installing;
}

interface PackageUploadCompleteState {
	step: PackageUploadStep.Complete;
}

interface PackageUploadErrorState {
	step: PackageUploadStep.Error;
	error: Error;
}

type PackageUploadState = PackageUploadSelectState | PackageUploadConfirmState | PackageUploadUploadingState | PackageUploadInstallingState | PackageUploadCompleteState | PackageUploadErrorState;

export const PackageUploadModal: FC<PackageUploadModalProps> = memo(function WrappedDataFileUploadModal({
	onClose
}) {

	const [uploadState, setUploadState] = useState<PackageUploadState>({ step: PackageUploadStep.Select });

	const [
		origin,
		datafiles,
		patcherExports,
		graphSets,
		rnboVersion,
		rnboCompatVersion,
		targetId
	] = useAppSelector((state) => [
		getRunnerOrigin(state),
		getDataFiles(state),
		getPatcherExports(state),
		getGraphSets(state),
		getRunnerInfoRecord(state, SystemInfoKey.RNBOVersion),
		getRunnerInfoRecord(state, SystemInfoKey.RNBOCompatVersion),
		getRunnerInfoRecord(state, SystemInfoKey.TargetId)
	]);

	const showFullScreen = useIsMobileDevice();

	const onSetPackageFile = useCallback(async (files: FileWithPath[]) => {
		try {
			if (!files.length || files.length > 1) throw new Error("Please select a single file.");
			const file = files[0];
			if (file.name.split(".").pop() !== PACKAGE_EXTENSION) throw new Error(`${file.name} is not a ${PACKAGE_EXTENSION} file`);
			const pkgInfo = PackageInfoRecord.fromDescription(await readInfoFromPackageFile(file));
			setUploadState({
				status: getPackageUploadStatus(pkgInfo, datafiles, patcherExports, graphSets),
				file,
				pkgInfo,
				step: PackageUploadStep.Confirm
			} as PackageUploadConfirmState);
		} catch (err) {
			console.error(err);
			setUploadState({ error: err, step: PackageUploadStep.Error } as PackageUploadErrorState);
		}
	}, [setUploadState, datafiles, patcherExports, graphSets]);

	const onSubmit = useCallback(async () => {
		try {
			if (uploadState.step !== PackageUploadStep.Confirm || !uploadState.file) {
				throw new Error("Missing package file to upload");
			}

			setUploadState({ step: PackageUploadStep.Uploading, progress: 0 });

			await uploadFileToRemote(
				origin,
				RunnerFileType.Package, uploadState.file, uploadState.file.name,
				(progress) => setUploadState({ step: PackageUploadStep.Uploading, progress })
			);

			setUploadState({ step: PackageUploadStep.Installing });

			await installPackageOnRunner(uploadState.file?.name);
			setUploadState({ step: PackageUploadStep.Complete });

		} catch (err) {
			console.error(err);
			setUploadState({ error: err, step: PackageUploadStep.Error });
		}
	}, [origin, setUploadState, uploadState]);

	const onCancel = useCallback(() => {
		setUploadState({ step: PackageUploadStep.Select });
	}, [setUploadState]);

	const onTriggerClose = useCallback(() => {
		setUploadState({ step: PackageUploadStep.Select });
		onClose();
	}, [onClose, setUploadState]);

	let content: ReactNode;
	switch (uploadState.step) {
		case PackageUploadStep.Select: {
			content = <FileDropZone
				maxFiles={ 1 }
				fileIcon={ mdiPackageUp }
				setFiles={ onSetPackageFile }
			/>;
			break;
		}
		case PackageUploadStep.Confirm: {
			content = <PackageUploadConfirmForm
				status={ uploadState.status }
				info={ uploadState.pkgInfo }
				onCancel={ onCancel }
				onSubmit={ onSubmit }
				supportsRNBOVersion={ uploadState.pkgInfo.supportsRNBOVersion(rnboCompatVersion || rnboVersion) }
				supportsTarget={ uploadState.pkgInfo.supportsTarget(targetId) }
			/>;
			break;
		}
		case PackageUploadStep.Uploading: {
			content = (
				<Stack gap="md">
					<Center>
						<RingProgress
							sections={ [{ value: uploadState.progress, color: "blue.6" }] }
							size={ 40 }
							thickness={ 5 }
							label={ (
								<Center>
									<IconElement path={ mdiLoading } spin color="blue.6" />
								</Center>
							)}
						/>
					</Center>
					<Text fw="bold" ta="center">Uploading Package</Text>
				</Stack>
			);
			break;
		}
		case PackageUploadStep.Installing: {
			content = (
				<Stack gap="md">
					<Center>
						<RingProgress
							sections={ [{ value: 100, color: "blue.6" }] }
							size={ 40 }
							thickness={ 5 }
							label={ (
								<Center>
									<IconElement path={ mdiLoading } spin color="blue.6" />
								</Center>
							)}
						/>
					</Center>
					<Text fw="bold" ta="center">Installing Package...</Text>
				</Stack>
			);
			break;
		}
		case PackageUploadStep.Complete: {
			content = (
				<Stack gap="md">
					<Alert variant="light" color="teal" title="Success">
						Package successfully installed
					</Alert>
					<Group justify="flex-end">
						<Button onClick={ onTriggerClose } >
							Close
						</Button>
					</Group>
				</Stack>
			);
			break;
		}
		case PackageUploadStep.Error: {
			content = (
				<Stack gap="md">
					<Alert variant="light" color="red" title="Error">
						Error while attempting to upload package: <br/>
						{ uploadState.error.message }
					</Alert>
					<Group justify="flex-end">
						<Button onClick={ onCancel } >
							Close
						</Button>
					</Group>
				</Stack>
			);
			break;
		}
		default:
			((_: never) => { })(uploadState); // check we exhausted all case options
	}

	return (
		<Modal.Root opened onClose={ onTriggerClose } fullScreen={ showFullScreen } size="lg" >
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Upload Package</Modal.Title>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body>
					{ content }
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
