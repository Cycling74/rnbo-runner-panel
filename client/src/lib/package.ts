import { Map as ImmuMap } from "immutable";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import type { Readable } from "node:stream";
import tar from "tar-stream";
import { RunnerPackageInfo } from "./types";
import { DataFileRecord } from "../models/datafile";
import { PatcherExportRecord } from "../models/patcher";
import { GraphSetRecord } from "../models/set";
import { PackageInfoRecord } from "../models/packageInfo";
import { PackageType } from "../lib/constants";

export async function readInfoFromPackageFile(file: File): Promise<RunnerPackageInfo> {

	const nodeStream = new ReadableWebToNodeStream(file.stream()) as unknown as Readable;
	const extract = tar.extract();
	nodeStream.pipe(extract);

	let info: RunnerPackageInfo;
	let root: string | undefined;

	for await (const entry of extract) {

		if (!root && entry.header.type === "directory") {
			root = entry.header.name;
		} else if (root && entry.header.name === `${root}info.json`) {

			const result: string[] = [];
			const decoder = new TextDecoder();

			for await (const chunk of entry) {
				result.push(decoder.decode(chunk));
			}

			try {
				info = JSON.parse(result.join(""));
			} catch (err) {
				throw new Error("Failed to parse info.json");
			}
		}
		entry.resume();
	}

	if (!info) {
		throw new Error("Missing info.json file in package");
	}

	return info;
}

export type PackageUploadConflicts = {
	datafiles: Array<DataFileRecord["fileName"]>;
	patchers: Array<PatcherExportRecord["name"]>;
	sets: Array<GraphSetRecord["name"]>;
};

export const getPackageUploadConflicts = (
	uploadInfo: PackageInfoRecord,
	datafiles: ImmuMap<DataFileRecord["id"], DataFileRecord>,
	patcherExports: ImmuMap<PatcherExportRecord["id"], PatcherExportRecord>,
	graphSets: ImmuMap<GraphSetRecord["id"], GraphSetRecord>
): PackageUploadConflicts => {
	return {
		datafiles: uploadInfo?.datafiles
			.map(pkgD => datafiles.find(d => d.fileName === pkgD.name)?.fileName)
			.filter(d => !!d)
			.toArray() || [],
		patchers: uploadInfo?.patchers
			.map(pkgP => patcherExports.find(p => p.name === pkgP.name)?.name)
			.filter(p => !!p)
			.toArray() || [],
		sets: uploadInfo?.sets
			.map(pkgS => graphSets.find(s => s.name === pkgS.name)?.name)
			.filter(s => !!s)
			.toArray() || []
	};
};

export const getPackageFromRemote = async (origin: string, packageType: PackageType, itemName?: string) => {
	const link = document.createElement("a");
	let target;
	switch (packageType) {
		case PackageType.All:
			target = "all";
			break;
		case PackageType.Patcher:
			target = `patchers/${itemName!}`;
			break;
		case PackageType.Set:
			target = `graphs/${itemName!}`;
			break;
		default:
			throw new Error(`${packageType} download not implemented`);
	}
	link.href = `${origin}/packages/${target}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
