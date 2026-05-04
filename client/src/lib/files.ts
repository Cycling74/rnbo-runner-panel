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

export const getFileListFromRemote = async (origin: string, fileType: RunnerFileType, subdirPath = "") => {
	const subdir = fileTypeSubdir(fileType);
	const path = subdirPath ? `${subdir}/${subdirPath}/` : `${subdir}/`;
	const { data }: { data: FileList } = await axios.get(
		`${origin}/files/${path}`,
		{
			headers: { Accept: "application/json" }
		}
	);
	return data;
};

export type FileEntry = { path: string; isDir: boolean };

export const getAllFilesFromRemote = async (
	origin: string, fileType: RunnerFileType, subdir = ""
): Promise<FileEntry[]> => {
	const list = await getFileListFromRemote(origin, fileType, subdir);
	const results: FileEntry[] = [];
	for (const item of list.items) {
		const rel = subdir ? `${subdir}/${item.name}` : item.name;
		if (item.dir) {
			const sub = await getAllFilesFromRemote(origin, fileType, rel);
			if (sub.length === 0) results.push({ path: rel, isDir: true });
			else results.push(...sub);
		} else {
			results.push({ path: rel, isDir: false });
		}
	}
	return results;
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

export const uploadFileToRemote = async (origin: string, fileType: RunnerFileType, upload: FileWithPath, destPath: string, onProgress?: progressCallback) => {
	const subdir = fileTypeSubdir(fileType);
	await axios.put(`${origin}/files/${subdir}/${destPath}`, upload, {
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
