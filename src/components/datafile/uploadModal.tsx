import { Map as ImmuMap } from "immutable";
import { ActionIcon, Alert, Button, Center, Group, Modal, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFileAudio, faHourglass, faHourglassHalf, faUpload, faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import classes from "./datafile.module.css";
import { formatFileSize } from "../../lib/util";
import { v4 } from "uuid";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { uploadFileToRemote } from "../../actions/datafiles";
import { AppDispatch } from "../../lib/store";
import { showNotification } from "../../actions/notifications";
import { NotificationLevel } from "../../models/notification";

const AUDIO_MIME_TYPE: string[] = [
	"audio/x-aiff",
	"audio/wav", "audio/wave", "audio/x-wav", "audio/x-pn-wav",
	"audio/flac", "audio/x-flac",
	//TODO more formats, mpeg, etc?
];

type UploadFile = {
	id: string;
	file: FileWithPath;
	progress: number;
	error?: Error;
}

export type DataFileUploadModalProps = {
	maxFileCount?: number;
	onClose: () => any;
};

const FileDropZone: FC<{ maxFiles: number; setFiles: (files: FileWithPath[]) => any; }> = memo(function WrappedDateFileDropzone({
	maxFiles,
	setFiles
}) {
	return (
		<Dropzone
			accept={ AUDIO_MIME_TYPE }
			onDrop={ setFiles }
			className={ classes.fileDropZone }
			maxFiles={ maxFiles }
		>
			<Group className={ classes.fileDropGroup } >
				<Dropzone.Accept>
					<FontAwesomeIcon icon={ faUpload } size="3x" fixedWidth />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<FontAwesomeIcon icon={ faXmark } size="3x" fixedWidth />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<FontAwesomeIcon icon={ faFileAudio } size="3x" fixedWidth />
				</Dropzone.Idle>
				<div>
					<Text size="xl" inline>
						Drag here or click to select
					</Text>
					<Text size="md" c="dimmed" inline mt="md">
						Choose { maxFiles === 1 ? "a single audio file" : `up to ${maxFiles} audio files` }
					</Text>
				</div>
			</Group>
		</Dropzone>
	);
});

type FileUploadRowProps = {
	upload: UploadFile;
	isUploading: boolean;
	onRemove: (file: UploadFile) => any;
};

export const FileUploadRow: FC<FileUploadRowProps> = ({
	upload,
	isUploading,
	onRemove
}) => {

	let color: string;
	let icon;
	if (upload.error) {
		color = "red";
		icon = faXmarkCircle;
	} else if (upload.progress === 0) {
		color = "gray";
		icon = faHourglass;
	} else if (upload.progress >= 100) {
		color = "teal";
		icon = faCheck;
	} else {
		color = "blue.6";
		icon = faHourglassHalf;
	}

	return (
		<Table.Tr key={ upload.file.name } >
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ upload.file.name }
				</Text>
				{
					upload.error ? <Text color="red" size="xs">{ upload.error.message }</Text> : null
				}
			</Table.Td>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ formatFileSize(upload.file.size) }
				</Text>
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					{
						isUploading || upload.progress >= 100 || upload.error ? null : (
							<ActionIcon variant="default" size="sm" onClick={ () => onRemove(upload) } >
								<FontAwesomeIcon icon={ faXmark } />
							</ActionIcon>
						)
					}
					<RingProgress
						hidden={ !(isUploading || upload.error || upload.progress !== 0) }
						sections={ [{ value: upload.progress, color: "blue.6" }] }
						size={ 40 }
						thickness={ 5 }
						label={ (
							<Center>
								<Text c={ color } >
									<FontAwesomeIcon icon={ icon } color="inherit" />
								</Text>
							</Center>
						)}
					/>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};

enum UploadStep {
	Select,
	Confirm,
	Uploading,
	Error
}

const doUpload = async (dispatch: AppDispatch, file: File, onProgress: (progress: number) => any) => new Promise<void>((resolve, reject) => {
	dispatch(uploadFileToRemote(file, { resolve, reject, onProgress }));
});

export const DataFileUploadModal: FC<DataFileUploadModalProps> = memo(function WrappedDataFileUploadModal({
	onClose,
	maxFileCount = 1
}) {
	const dispatch = useAppDispatch();
	const [uploads, setUploads] = useState<ImmuMap<UploadFile["id"], UploadFile>>(ImmuMap<UploadFile["id"], UploadFile>());
	const [step, setStep] = useState<UploadStep>(UploadStep.Select);

	const showFullScreen = useIsMobileDevice();

	const onSetFiles = useCallback((files: FileWithPath[]) => {
		setUploads(ImmuMap<UploadFile["id"], UploadFile>().withMutations(m => {
			for (const file of files) {
				const f = { id: v4(), file, progress: 0 };
				m.set(f.id, f);
			}
		}));

		setStep(UploadStep.Confirm);
	}, [setUploads, setStep]);

	const onCancel = useCallback(() => {
		setStep(UploadStep.Select);
		setUploads(ImmuMap<UploadFile["id"], UploadFile>());
	}, [setStep, setUploads]);

	const onSubmit = useCallback(async () => {
		setStep(UploadStep.Uploading);

		let errored = false;
		for (const upload of uploads.valueSeq().toArray()) {
			try {
				await doUpload(dispatch, upload.file, (progress: number) => {
					setUploads(up => up.set(upload.id, { ...upload, progress }));
				});
			} catch (err) {
				errored = true;
				setUploads(up => up.set(upload.id, { ...upload, progress: 0, error: err }));
			}
		}

		if (!errored) {
			dispatch(showNotification({ title: "Upload Complete", message: `Successfully uploaded ${uploads.size === 1 ? uploads.first().file.name : `${uploads.size} files`}`, level: NotificationLevel.success }));
			onClose();
		} else {
			setStep(UploadStep.Error);
		}
	}, [setStep, uploads, setUploads, dispatch, onClose]);

	const onTriggerClose = useCallback(() => {
		if (step === UploadStep.Uploading) return;
		onClose();
	}, [onClose, step]);

	const onRemoveUpload = useCallback((file: UploadFile) => {
		const updated = uploads.delete(file.id);
		setUploads(updated);
		if (!updated.size) setStep(UploadStep.Select);
	}, [uploads, setUploads, setStep]);

	return (
		<Modal.Root opened onClose={ onTriggerClose } fullScreen={ showFullScreen } size="lg">
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Upload Files</Modal.Title>
					{ step === UploadStep.Uploading ? null : <Modal.CloseButton /> }
				</Modal.Header>
				<Modal.Body>
					<Stack gap="xl">
						{
							step === UploadStep.Select ? <FileDropZone maxFiles={ maxFileCount } setFiles={ onSetFiles } /> : null
						}
						{
							step === UploadStep.Confirm || step === UploadStep.Uploading || step === UploadStep.Error ? (
								<>
									<Table verticalSpacing="sm">
										<Table.Thead>
											<Table.Tr>
												<Table.Th>Filename</Table.Th>
												<Table.Th>Size</Table.Th>
												<Table.Th></Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											{
												uploads.valueSeq().map(f => <FileUploadRow key={ f.id } upload={ f } isUploading={ step === UploadStep.Uploading } onRemove={ onRemoveUpload } />)
											}
										</Table.Tbody>
									</Table>
									<Group justify="flex-end">
										<Button.Group>
											<Button
												variant="light"
												color="gray"
												onClick={ onCancel }
												leftSection={ <FontAwesomeIcon icon={ faXmark } /> }
												disabled={ step === UploadStep.Uploading }
											>
												Cancel
											</Button>
											<Button
												onClick={ onSubmit }
												leftSection={ <FontAwesomeIcon icon={ faUpload } /> }
												loading={ step === UploadStep.Uploading }
												disabled={ step === UploadStep.Uploading || step === UploadStep.Error }
											>
												Upload
											</Button>
										</Button.Group>
									</Group>
								</>
							) : null
						}
						{
							step === UploadStep.Error ? (
								<Alert variant="light" color="red" title="Error">
									Not all files were uploaded successfully. Please check the details above for more info
								</Alert>
							) : null
						}
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
