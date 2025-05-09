import * as Base64 from "js-base64";
import { RunnerCmdReadMethod, RunnerCmdWriteMethod, RunnerFileType } from "../lib/constants";
import { oscQueryBridge, RunnerCmd } from "./oscqueryBridgeController";
import { RunnerDeleteFileResponse, RunnerReadFileResponse, RunnerReadFileResult } from "../lib/types";

const FILE_READ_CHUNK_SIZE = 1024;

// Read CMDs
export const getFileListFromRunnerCmd = async (filetype: RunnerFileType): Promise<string[]> => {
	const cmd = new RunnerCmd(
		RunnerCmdReadMethod.ReadFileList,
		{
			filetype,
			size: FILE_READ_CHUNK_SIZE
		}
	);

	const stream = oscQueryBridge.getCmdReadableStream<RunnerReadFileResponse>(cmd);
	const reader = stream.getReader();
	const sequences: Array<RunnerReadFileResult> = [];

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

// Write CMDs

type WriteFileInfo = {
	name: string;
	size: number;
	type: RunnerFileType;
};

const writeFileCmdTransform = (
	fileInfo: WriteFileInfo,
	onProgress?: (p: number) => void
) => {
	let current = 0;

	return new TransformStream<Uint8Array, RunnerCmd>(
		{
			transform(chunk, controller) {
				controller.enqueue(
					new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
						filename: fileInfo.name,
						filetype: fileInfo.type,
						data: Base64.fromUint8Array(chunk, false),
						append: current !== 0
					})
				);
				current += chunk.byteLength;
				onProgress?.((current / fileInfo.size) * 100);
			},

			flush(controller) {
				controller.enqueue(
					new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
						filename: fileInfo.name,
						filetype: fileInfo.type,
						data: "",
						append: true,
						complete: true
					})
				);
			}
		},
		new CountQueuingStrategy({ highWaterMark: 1 }),
		new CountQueuingStrategy({ highWaterMark: 1 })
	);
};

export const writeFileToRunnerCmd = async (file: File, type: RunnerFileType, onProgress?: (progress: number) => void): Promise<void> => {
	const writeStream = oscQueryBridge.getCmdWritableStream(RunnerCmdWriteMethod.WriteFile);
	if (writeStream.locked) throw new Error("Can't write cmd to stream as it's already locked");

	await file.stream()
		.pipeThrough(writeFileCmdTransform({ name: file.name, size: file.size, type }, onProgress))
		.pipeTo(writeStream);
};
