import * as Base64 from "js-base64";
import { RunnerChunkSize, RunnerCmdReadMethod, RunnerCmdResultCode, RunnerCmdWriteMethod, RunnerFileType } from "../lib/constants";
import { oscQueryBridge, RunnerCmd } from "./oscqueryBridgeController";
import { RunnerDeleteFileResponse, RunnerReadFileContentResponse, RunnerReadFileListResponse, RunnerReadFileListResult, RunnerReadFileContentResult, RunnerCreatePackageResult, RunnerCreatePackageResponse, RunnerInstallPackageResponse, RunnerInstallPackageResult } from "../lib/types";
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

export async function installPackageOnRunner(packageFilename: string): Promise<RunnerInstallPackageResult> {

	const cmd = new RunnerCmd(RunnerCmdReadMethod.InstallPackage, {
		filename: packageFilename
	});

	const stream = oscQueryBridge.getCmdReadableStream<RunnerInstallPackageResponse>(cmd);
	const reader = stream.getReader();
	let result: RunnerInstallPackageResult | undefined = undefined;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value.code === RunnerCmdResultCode.Success) {
			result = value;
		}
	}

	if (!result) throw new Error("Missing success response when attempting to install package.");
	return result;

}


class ReadFileTransformer implements Transformer<RunnerReadFileContentResult, ArrayBufferLike> {

	private extra: string = "";
	private readonly onProgress: (p: number) => void | undefined;

	constructor(
		onProgress?: (p: number) => void
	) {
		this.onProgress = onProgress || undefined;
	}

	transform?: TransformerTransformCallback<RunnerReadFileContentResult, ArrayBufferLike> = (
		result,
		controller
	) => {
		if (result?.content64 === undefined) {
			controller.error(new Error("Missing content64 data"));
			return;
		}

		const chunk = this.extra + result.content64;
		this.extra = "";

		const bytes = Math.floor(chunk.length / 4);
		const overflow = chunk.length % 4;

		const data = Base64.toUint8Array(chunk.slice(0, bytes * 4));
		if (overflow !== 0) this.extra = chunk.slice(overflow * -1);

		controller.enqueue(data.buffer);
		this.onProgress?.(result.progress);
	};
}

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
		.pipeThrough(new TransformStream(new ReadFileTransformer()))
		.pipeTo(await handle.createWritable({ keepExistingData: false }));

	return;
};


// Write CMDs
type WriteFileInfo = {
	name: string;
	type: RunnerFileType;
};
class WriteFileTransformer implements Transformer<Uint8Array, RunnerCmd> {

	private buffered: Uint8Array | undefined = undefined;
	private append: boolean = false;
	private readonly fileInfo: WriteFileInfo;

	constructor(
		fileInfo: WriteFileInfo
	) {
		this.fileInfo = fileInfo;
	}

	private convertChunkToCmd(chunk: Uint8Array): RunnerCmd {
		const cmd = new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
			filename: this.fileInfo.name,
			filetype: this.fileInfo.type,
			data: Base64.fromUint8Array(chunk, false),
			append: this.append
		});
		this.append = true;
		return cmd;

	}

	transform: TransformerTransformCallback<Uint8Array, RunnerCmd> = (
		chunk,
		controller
	) => {
		let pos = 0;

		if (this.buffered) {
			// Previously buffered chunk?
			const incomingLength = RunnerChunkSize.Write - this.buffered.length > chunk.length ? chunk.length : RunnerChunkSize.Write - this.buffered.length;
			const mergedArray = new Uint8Array(this.buffered.length + incomingLength);
			mergedArray.set(this.buffered, 0);
			mergedArray.set(chunk.subarray(0, incomingLength), this.buffered.length);
			controller.enqueue(this.convertChunkToCmd(mergedArray));
			pos = incomingLength;
			this.buffered = undefined;
		}

		if (pos + RunnerChunkSize.Write > chunk.length) {
			// write all at once
			controller.enqueue(this.convertChunkToCmd(chunk.subarray(pos)));
		} else {

			while (pos + RunnerChunkSize.Write < chunk.length) {
				const end = pos + RunnerChunkSize.Write;
				controller.enqueue(this.convertChunkToCmd(chunk.subarray(pos, end)));
				pos = end;
			}

			if (pos < chunk.length) {
				// Buffer Overflow
				this.buffered = chunk.subarray(pos);
			}
		}
	};

	flush: TransformerFlushCallback<RunnerCmd> = (
		controller
	) => {
		controller.enqueue(
			new RunnerCmd(RunnerCmdWriteMethod.WriteFile, {
				filename: this.fileInfo.name,
				filetype: this.fileInfo.type,
				data: "",
				append: true,
				complete: true
			})
		);
	};
}

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
		.pipeThrough(new TransformStream<Uint8Array, RunnerCmd>(new WriteFileTransformer({ name: file.name, type })))
		.pipeTo(writeStream);
};
