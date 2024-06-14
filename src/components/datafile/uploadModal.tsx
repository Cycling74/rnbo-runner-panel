import { Button, Center, Group, Modal, RingProgress, Stack, Table, Text } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAudio, faHourglass, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import classes from "./datafile.module.css";
import { formatFileSize } from "../../lib/util";

export type DataFileUploadModalProps = {
	onClose: () => any;
};

const FileDropZone: FC<{ setFiles: (files: FileWithPath[]) => any; }> = memo(function WrappedDateFileDropzone({
	setFiles
}) {
	return (
		<Dropzone
			accept={[ "audio/aiff", "audio/wav", "image/png"]}
			onDrop={ setFiles }
			className={ classes.fileDropZone }
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
						Drag audio files here or click to select files
					</Text>
					<Text size="md" c="dimmed" inline mt="md">
						Attach as many files as you like
					</Text>
				</div>
			</Group>
		</Dropzone>
	);
});

export const DataFileUploadModal: FC<DataFileUploadModalProps> = memo(function WrappedDataFileUploadModal({
	onClose
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
					!files.length ? <FileDropZone setFiles={ setFiles} /> : null
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
									files.map(f => (
										<Table.Tr key={ f.name } >
											<Table.Td>
												<Text fz="sm" truncate="end">
													{ f.name }
												</Text>
											</Table.Td>
											<Table.Td>
												<Text fz="sm" truncate="end">
													{ formatFileSize(f.size) }
												</Text>
											</Table.Td>
											<Table.Td>
												{
													isUploading ? (
														<Group justify="flex-end">
															<RingProgress
																sections={ [{ value: 0, color: "primary" }] }
																size={ 30 }
																thickness={ 2 }
																label={ (
																	<Center>
																		<FontAwesomeIcon icon={ faHourglass } size="xs" />
																	</Center>
																)}
															/>
														</Group>
													) : null
												}
											</Table.Td>
										</Table.Tr>
									))
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
