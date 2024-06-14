import { ActionIcon, Button, Center, Group, Modal, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFileAudio, faHourglass, faHourglassHalf, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import classes from "./datafile.module.css";
import { formatFileSize } from "../../lib/util";

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
	file: FileWithPath;
	isUploading: boolean;
	onRemove: (file: FileWithPath) => any;
	progress: number;
};

export const FileUploadRow: FC<FileUploadRowProps> = ({
	file,
	isUploading,
	onRemove,
	progress
}) => {

	const color = progress >= 100 ? "teal" : progress === 0 ? "gray" : "blue.6";
	const icon = progress >= 100 ? faCheck : progress === 0 ? faHourglass : faHourglassHalf;
	return (
		<Table.Tr key={ file.name } >
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ file.name }
				</Text>
			</Table.Td>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ formatFileSize(file.size) }
				</Text>
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					<ActionIcon variant="default" size="sm" onClick={ () => onRemove(file) } hidden={ isUploading } >
						<FontAwesomeIcon icon={ faXmark } />
					</ActionIcon>
					<RingProgress
						hidden={ !isUploading }
						sections={ [{ value: progress, color: "blue.6" }] }
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
	const [files, setFiles] = useState<FileWithPath[]>([]);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const showFullScreen = useIsMobileDevice();

	const onCancel = useCallback(() => {
		setIsUploading(false);
		setFiles([]);
	}, [setIsUploading, setFiles]);

	const onSubmit = useCallback(() => {
		setIsUploading(true);
	}, [setIsUploading]);

	const onTriggerClose = useCallback(() => {
		if (isUploading) return;
		onClose();
	}, [onClose, isUploading]);

	const onRemoveFile = useCallback((file: FileWithPath) => {
		setFiles(files.filter(f => f !== file));
	}, [files, setFiles]);

	return (
		<Modal
			onClose={ onTriggerClose }
			opened={ true }
			fullScreen={ showFullScreen }
			size="lg"
			title="Upload Sample Dependencies"
		>
			<Stack gap="xl">
				{
					!files.length ? <FileDropZone maxFiles={ maxFileCount } setFiles={ setFiles} /> : null
				}
				{
					files.length ? (
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
									files.map(f => <FileUploadRow key={ f.name } file={ f } isUploading={ isUploading } onRemove={ onRemoveFile } progress={ 0 } />)
								}
							</Table.Tbody>
						</Table>
					) : null
				}
				{
					!files.length || isUploading ? null : (
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
		</Modal>
	);
});
