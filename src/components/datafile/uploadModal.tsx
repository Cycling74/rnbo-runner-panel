import { ActionIcon, Button, Center, Group, Modal, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFileAudio, faHourglass, faHourglassHalf, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import classes from "./datafile.module.css";
import { formatFileSize } from "../../lib/util";
import { v4 } from "uuid";

type UploadFile = {
	id: string;
	file: FileWithPath;
	progress: number;
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
			accept={[ "audio/aiff", "audio/wav", "image/png"]}
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

	const color = upload.progress >= 100 ? "teal" : upload.progress === 0 ? "gray" : "blue.6";
	const icon = upload.progress >= 100 ? faCheck : upload.progress === 0 ? faHourglass : faHourglassHalf;
	return (
		<Table.Tr key={ upload.file.name } >
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ upload.file.name }
				</Text>
			</Table.Td>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ formatFileSize(upload.file.size) }
				</Text>
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					<ActionIcon variant="default" size="sm" onClick={ () => onRemove(upload) } hidden={ isUploading } >
						<FontAwesomeIcon icon={ faXmark } />
					</ActionIcon>
					<RingProgress
						hidden={ !isUploading }
						sections={ [{ value: upload.progress, color: "blue.6" }] }
						size={ 40 }
						thickness={ 2 }
						label={ (
							<Center>
								<Text c={ color } >
									<FontAwesomeIcon icon={ icon } size="xs" color="inherit" />
								</Text>
							</Center>
						)}
					/>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};

export const DataFileUploadModal: FC<DataFileUploadModalProps> = memo(function WrappedDataFileUploadModal({
	onClose,
	maxFileCount = 1
}) {
	const [uploads, setUploads] = useState<UploadFile[]>([]);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const showFullScreen = useIsMobileDevice();

	const onSetFiles = useCallback((files: FileWithPath[]) => {
		setUploads(files.map(file => ({
			id: v4(),
			file,
			progress: 0
		})));
	}, [setUploads]);

	const onCancel = useCallback(() => {
		setIsUploading(false);
		setUploads([]);
	}, [setIsUploading, setUploads]);

	const onSubmit = useCallback(() => {
		setIsUploading(true);
	}, [setIsUploading]);

	const onTriggerClose = useCallback(() => {
		if (isUploading) return;
		onClose();
	}, [onClose, isUploading]);

	const onRemoveUpload = useCallback((file: UploadFile) => {
		setUploads(uploads.filter(f => f.id !== file.id));
	}, [uploads, setUploads]);

	return (
		<Modal.Root opened onClose={ onTriggerClose } fullScreen={ showFullScreen } size="lg">
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Modal title</Modal.Title>
					{ isUploading ? null : <Modal.CloseButton /> }
				</Modal.Header>
				<Modal.Body>
					<Stack gap="xl">
						{
							!uploads.length ? <FileDropZone maxFiles={ maxFileCount } setFiles={ onSetFiles } /> : null
						}
						{
							uploads.length ? (
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
											uploads.map(f => <FileUploadRow key={ f.id } upload={ f } isUploading={ isUploading } onRemove={ onRemoveUpload } />)
										}
									</Table.Tbody>
								</Table>
							) : null
						}
						{
							!uploads.length || isUploading ? null : (
								<Group justify="flex-end">
									<Button.Group>
										<Button
											variant="light"
											color="gray"
											onClick={ onCancel }
											leftSection={ <FontAwesomeIcon icon={ faXmark } /> }
										>
											Cancel
										</Button>
										<Button
											onClick={ onSubmit }
											leftSection={ <FontAwesomeIcon icon={ faUpload } /> }
										>
											Upload
										</Button>
									</Button.Group>
								</Group>
							)
						}
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
