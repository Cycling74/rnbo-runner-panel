import { Alert, Button, Center, Fieldset, Group, Modal, Paper, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, FormEvent, memo, ReactNode, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { FileWithPath } from "@mantine/dropzone";
import { IconElement } from "../elements/icon";
import { mdiAlertCircleOutline, mdiClose, mdiFileExport, mdiFileMusic, mdiGroup, mdiLoading, mdiPackage, mdiUpload } from "@mdi/js";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { ResourceType, SystemInfoKey } from "../../lib/constants";
import { FileDropZone, FileDropZoneProps } from "../page/fileDropZone";
import { getRunnerInfoRecord, getRunnerOrigin } from "../../selectors/appStatus";
import { PackageInfoRecord } from "../../models/packageInfo";
import { getPackageUploadConflicts, PackageUploadConflicts, readInfoFromPackageFile } from "../../lib/package";
import { getDataFiles } from "../../selectors/datafiles";
import { getPatcherExports } from "../../selectors/patchers";
import { getGraphSets } from "../../selectors/sets";
import { installPackageOnRunner } from "../../controller/cmd";
import { uploadFileToRemote } from "../../lib/files";
import { RunnerFileType } from "../../lib/constants";

const PACKAGE_MIME_TYPE: FileDropZoneProps["accept"] = {
	"application/x-tar": [".rnbopack"]
};

export type UploadFile = {
	id: string;
	file: FileWithPath;
	progress: number;
	error?: Error;
}

type PackageContentItemProps = {
	hasConflict: boolean;
	resourceType: ResourceType;
	title: string;
};

const resourceTypeDisplay: Record<ResourceType, ReactNode> = {
	[ResourceType.DataFile]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiFileMusic } />
			<span>Audio File</span>
		</Group>
	),
	[ResourceType.Patcher]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiFileExport } />
			<span>Patcher</span>
		</Group>
	),
	[ResourceType.Set]: (
		<Group gap={ 2 } align="center" >
			<IconElement path={ mdiGroup } />
			<span>Graph</span>
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
	hasConflict,
	resourceType,
	title
}) => {
	return (
		<Table.Tr>
			<Table.Td valign="top" >{ resourceTypeDisplay[resourceType] }</Table.Td>
			<Table.Td valign="top" >
				{ title }
				{
					hasConflict ? (
						<Text c="red" fz="xs" component="div" >
							<Group gap={ 2 } align="center">
								<IconElement path={ mdiAlertCircleOutline } />
								<span>An upload will overwrite the existing resource.</span>
							</Group>
						</Text>
					) : null
				}
			</Table.Td>
		</Table.Tr>
	);
};

type PackageUploadConfirmFormProps = {
	conflicts: PackageUploadConflicts;
	info: PackageInfoRecord;
	onCancel: () => void;
	onSubmit: () => void;
	supportsRNBOVersion: boolean;
	supportsTarget: boolean;
};

const PackageUploadConfirmForm: FC<PackageUploadConfirmFormProps> = ({
	conflicts,
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
		rnboVersion
	] = useAppSelector((state) => [
		supportsRNBOVersion && supportsTarget,
		getRunnerInfoRecord(state, SystemInfoKey.RNBOVersion)
	]);

	return (
		<form onSubmit={ onTriggerSubmit } >
			<Stack gap="lg">
				<Fieldset legend="Runner" >
					<Stack gap="md">
						<InfoCard title="Package Name" value={ info.name } />
						<Group grow>
							<InfoCard
								title="RNBO Version"
								value={ info.rnbo_version }
								error={ !supportsRNBOVersion ? `The package does not match the runner's RNBO version: ${rnboVersion.oscValue}` : undefined }
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
				<Fieldset legend="Contents" >
					<Table>
						<Table.Thead>
							<Table.Tr>
								<TableHeaderCell width={ 150 } >Type</TableHeaderCell>
								<TableHeaderCell >Name</TableHeaderCell>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{
								info.datafiles.map(df => (
									<PackageContentItem
										key={ `df_${df.id}`}
										hasConflict={ conflicts.datafiles.includes(df.name) }
										resourceType={ ResourceType.DataFile }
										title={ df.name }
									/>
								))
							}
							{
								info.patchers.map(patcher => (
									<PackageContentItem
										key={ `patcher_${patcher.id}`}
										hasConflict={ conflicts.patchers.includes(patcher.name) }
										resourceType={ ResourceType.Patcher }
										title={ patcher.name }
									/>
								))
							}
							{
								info.sets.map(set => (
									<PackageContentItem
										key={ `set${set.id}`}
										hasConflict={ conflicts.sets.includes(set.name) }
										resourceType={ ResourceType.Set }
										title={ set.name }
									/>
								))
							}
						</Table.Tbody>
					</Table>
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
	conflicts: PackageUploadConflicts;
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
		targetId
	] = useAppSelector((state) => [
		getRunnerOrigin(state),
		getDataFiles(state),
		getPatcherExports(state),
		getGraphSets(state),
		getRunnerInfoRecord(state, SystemInfoKey.RNBOVersion),
		getRunnerInfoRecord(state, SystemInfoKey.TargetId)
	]);

	const showFullScreen = useIsMobileDevice();

	const onSetPackageFile = useCallback(async (files: FileWithPath[]) => {
		try {
			if (!files.length || files.length > 1) throw new Error("Please select a single file.");
			const file = files[0];
			const pkgInfo = PackageInfoRecord.fromDescription(await readInfoFromPackageFile(file));
			setUploadState({
				conflicts: getPackageUploadConflicts(pkgInfo, datafiles, patcherExports, graphSets),
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
				RunnerFileType.Package, uploadState.file,
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
				accept={ PACKAGE_MIME_TYPE }
				maxFiles={ 1 }
				fileIcon={ mdiPackage }
				setFiles={ onSetPackageFile }
			/>;
			break;
		}
		case PackageUploadStep.Confirm: {
			content = <PackageUploadConfirmForm
				conflicts={ uploadState.conflicts }
				info={ uploadState.pkgInfo }
				onCancel={ onCancel }
				onSubmit={ onSubmit }
				supportsRNBOVersion={ uploadState.pkgInfo.supportsRNBOVersion(rnboVersion) }
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
