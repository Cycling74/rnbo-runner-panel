import * as Base64 from "js-base64";
import { RunnerChunkSize, RunnerCmdReadMethod, RunnerCmdResultCode, RunnerCmdWriteMethod, RunnerFileType } from "../lib/constants";
import { oscQueryBridge, RunnerCmd } from "./oscqueryBridgeController";
import { RunnerDeleteFileResponse, RunnerReadFileContentResponse, RunnerReadFileListResponse, RunnerReadFileListResult, RunnerReadFileContentResult, RunnerCreatePackageResult, RunnerCreatePackageResponse } from "../lib/types";
import { PatcherExportRecord } from "../models/patcher";
import { GraphSetRecord } from "../models/set";

const getSupportsFileSystemAccess = () => {
	return "showSaveFilePicker" in window && (() => {
		try {
			return window.self === window.top;
		} catch {
			return false;
		}
	})();
};

// Read CMDs
export const getFileListFromRunnerCmd = async (filetype: RunnerFileType): Promise<string[]> => {
	const cmd = new RunnerCmd(
		RunnerCmdReadMethod.ReadFileList,
		{
			filetype,
			size: RunnerChunkSize.Read
		}
	);

	const stream = oscQueryBridge.getCmdReadableStream<RunnerReadFileListResponse>(cmd);
	const reader = stream.getReader();
	const sequences: Array<RunnerReadFileListResult> = [];

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		sequences.push(value);
	}

	const filePaths: string = sequences
		.sort((a, b) => a.seq - b.seq)
		.map((v, currentSeq) => {
			if (v.seq === undefined || v.seq !== currentSeq) {
				throw new Error(`unexpected sequence number ${v.seq}`);
			}
			return v.content;
		})
		.join("");

	return JSON.parse(filePaths);
};

export const deleteFileFromRunnerCmd = async (filename: string, filetype: RunnerFileType): Promise<boolean> => {
	const cmd = new RunnerCmd(RunnerCmdReadMethod.DeleteFile, {
		filename,
		filetype
	});

	const stream = oscQueryBridge.getCmdReadableStream<RunnerDeleteFileResponse>(cmd);
	const reader = stream.getReader();

	let success: boolean = false;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		success = value.message === "deleted";
	}

	return success;
};

export async function createPackageOnRunner(patcher: PatcherExportRecord): Promise<RunnerCreatePackageResult>;
export async function createPackageOnRunner(set: GraphSetRecord): Promise<RunnerCreatePackageResult>;
export async function createPackageOnRunner(item: PatcherExportRecord | GraphSetRecord): Promise<RunnerCreatePackageResult> {


	const params = item instanceof PatcherExportRecord
		? { patcher: item.name }
		: { set: item.name };

	const cmd = new RunnerCmd(RunnerCmdReadMethod.CreatePackage, params);


	const stream = oscQueryBridge.getCmdReadableStream<RunnerCreatePackageResponse>(cmd);
	const reader = stream.getReader();
	let result: RunnerCreatePackageResult | undefined = undefined;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value.code === RunnerCmdResultCode.Success) {
			result = value;
		}
	}

	if (!result) throw new Error("Missing success response when attempting to create package.");
	return result;
}

const readFileCmdTransform = (
	onProgress?: (p: number) => void
) => {

	let extra = "";
	return new TransformStream<RunnerReadFileContentResult, ArrayBufferLike>(
		{
			transform(result: RunnerReadFileContentResult, controller) {
				if (result?.content64 === undefined) {
					controller.error(new Error("Missing content64 data"));
					return;
				}

				const chunk = extra + result.content64;
				extra = "";

				const bytes = Math.floor(chunk.length / 4);
				const overflow = chunk.length % 4;

				const data = Base64.toUint8Array(chunk.slice(0, bytes * 4));
				if (overflow !== 0) extra = chunk.slice(overflow * -1);

				controller.enqueue(data.buffer);
				onProgress?.(result.progress);
			}
		}
	);
};

export const readFileFromRunnerCmd = async (filename: string, filetype: RunnerFileType): Promise<void> => {

	if (!getSupportsFileSystemAccess()) throw new Error("FileSystem Access API is not supported");

	const handle = await window.showSaveFilePicker({
		id: "saveFile",
		startIn: "downloads",
		suggestedName: filename
	});

	const cmd = new RunnerCmd(RunnerCmdReadMethod.ReadFileContent, {
		filename,
		filetype,
		size: RunnerChunkSize.Read
	});

	await oscQueryBridge.getCmdReadableStream<RunnerReadFileContentResponse>(cmd)
		.pipeThrough(readFileCmdTransform())
		.pipeTo(await handle.createWritable({ keepExistingData: false }));

	return;
};


// Write CMDs

type WriteFileInfo = {
	name: string;
	type: RunnerFileType;
};

const writeFileCmdTransform = (
	fileInfo: WriteFileInfo
) => {

	let append = false;
	return new TransformStream<Uint8Array, RunnerCmd>(
		{
			transform(chunk, controller) {
				for (let i = 0; i < chunk.byteLength; i += RunnerChunkSize.Write) {
					const end = i + RunnerChunkSize.Write;
					controller.enqueue(
						new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
							filename: fileInfo.name,
							filetype: fileInfo.type,
							data: Base64.fromUint8Array(chunk.subarray(i, end > chunk.byteLength ? undefined : end), false),
							append
						})
					);
					append = true;
				}
			},

			flush(controller) {
				controller.enqueue(
					new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
						filename: fileInfo.name,
						filetype: fileInfo.type,
						data: "",
						append,
						complete: true
					})
				);
			}
		}
	);
};

export const writeFileToRunnerCmd = async (file: File, type: RunnerFileType, onProgress?: (progress: number) => void): Promise<void> => {

	let written: number = 0;
	const writeStream = oscQueryBridge.getCmdWritableStream(
		RunnerCmdWriteMethod.WriteFile,
		(size: number) => {
			written += size;
			onProgress?.((written / file.size) * 100);
		}
	);
	if (writeStream.locked) throw new Error("Can't write cmd to stream as it's already locked");

	await file.stream()
		.pipeThrough(writeFileCmdTransform({ name: file.name, type }))
		.pipeTo(writeStream);
};
