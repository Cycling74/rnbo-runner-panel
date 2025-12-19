import axios from "axios";
import { RunnerFileType } from "../lib/constants";
import { FileList } from "../models/filelist";
import { FileWithPath } from "@mantine/dropzone";

const fileTypeSubdir = (fileType: RunnerFileType): string => {
	switch (fileType) {
		case RunnerFileType.DataFile:
			return "datafiles";
		case RunnerFileType.Package:
			return "packages/current";
		default:
			throw new Error(`fileTypeSubdir not implemented for ${fileType}`);
	}
};

export type progressCallback = (progress: number) => void;

export const deleteFileFromRemote = async (origin: string, fileType: RunnerFileType, fileName: string) => {
	const subdir = fileTypeSubdir(fileType);
	await axios.delete(`${origin}/files/${subdir}/${fileName}`);
};

export const getFileListFromRemote = async (origin: string, fileType: RunnerFileType) => {
	const subdir = fileTypeSubdir(fileType);
	const { data }: { data: FileList } = await axios.get(
		`${origin}/files/${subdir}/`,
		{
			headers: { Accept: "application/json" }
		}
	);
	return data;
};

export const downloadFileFromRemote = async (origin: string, fileType: RunnerFileType, fileName: string) => {
	const subdir = fileTypeSubdir(fileType);
	const link = document.createElement("a");
	link.href = `${origin}/files/${subdir}/${fileName}`;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const uploadFileToRemote = async (origin: string, fileType: RunnerFileType, upload: FileWithPath, onProgress?: progressCallback) => {
	const subdir = fileTypeSubdir(fileType);
	await axios.put(`${origin}/files/${subdir}/${upload.name}`, upload, {
		headers: {
			"Content-Type": upload.type
		},
		onUploadProgress: ({ progress }) => {
			if (onProgress) {
				onProgress(progress * 100);
			}
		}
	});
};
