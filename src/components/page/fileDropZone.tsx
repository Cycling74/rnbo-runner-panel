import { Dropzone, DropzoneProps, FileWithPath } from "@mantine/dropzone";
import { FC, memo } from "react";
import classes from "./page.module.css";
import { Group, Text } from "@mantine/core";
import { mdiUpload, mdiUploadOff } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { IconProps } from "@mdi/react/dist/IconProps";

export type FileDropZoneProps = {
	accept: DropzoneProps["accept"];
	fileIcon: IconProps["path"];
	maxFiles: number;
	setFiles: (files: FileWithPath[]) => void;
};

export const FileDropZone: FC<FileDropZoneProps> = memo(function WrappedFileDropzone({
	accept,
	fileIcon,
	maxFiles,
	setFiles
}) {
	return (
		<Dropzone
			accept={ accept }
			onDrop={ setFiles }
			className={ classes.fileDropZone }
			maxFiles={ maxFiles }
		>
			<Group className={ classes.fileDropGroup } >
				<Dropzone.Accept>
					<IconElement path={ mdiUpload } size={ 3 } />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<IconElement path={ mdiUploadOff } size={ 3 } />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<IconElement path={ fileIcon } size={ 3 } />
				</Dropzone.Idle>
				<div>
					<Text size="xl" inline>
						Drag here or click to select
					</Text>
					<Text size="md" c="dimmed" inline mt="md">
						Choose { maxFiles === 1 ? "a single file" : `up to ${maxFiles} files` }
					</Text>
				</div>
			</Group>
		</Dropzone>
	);
});
