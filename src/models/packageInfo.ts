import { List as ImmuList, Map as ImmuMap, Record as ImmuRecord } from "immutable";
import { RunnerPackageDataFileInfo, RunnerPackageInfo, RunnerPackagePatcherInfo, RunnerPackageSetInfo, RunnerPackageTargetInfo } from "../lib/types";
import { RunnerInfoRecord } from "./runnerInfo";

export type PackageDataFileInfoRecordProps = RunnerPackageDataFileInfo;

export class PackageDataFileInfoRecord extends ImmuRecord<PackageDataFileInfoRecordProps>({
	location: "",
	name: ""
}) {

	public static fromDescription(desc: RunnerPackageDataFileInfo): PackageDataFileInfoRecord {
		return new PackageDataFileInfoRecord(desc);
	}

	public get id(): string {
		return this.name;
	}
}

export type PackagePatcherInfoRecordProps = Omit<RunnerPackagePatcherInfo, "binaries"> & {
	binaries: ImmuMap<string, string>;
};

export class PackagePatcherInfoRecord extends ImmuRecord<PackagePatcherInfoRecordProps>({
	binaries: ImmuMap(),
	config: "",
	created_at: "",
	name: "",
	patcher: "",
	presets: ""
}) {

	public static fromDescription(desc: RunnerPackagePatcherInfo): PackagePatcherInfoRecord {
		return new PackagePatcherInfoRecord({
			...desc,
			binaries: ImmuMap<string, string>().withMutations(map => {
				for (const [id, bin] of Object.entries(desc.binaries)) {
					map.set(id, bin);
				}
			})
		});
	}

	public get id(): string {
		return this.name;
	}
}

export type PackageSetInfoRecordProps = RunnerPackageSetInfo;

export class PackageSetInfoRecord extends ImmuRecord<PackageSetInfoRecordProps>({
	created_at: "",
	location: "",
	name: ""
}) {

	public static fromDescription(desc: RunnerPackageSetInfo): PackageSetInfoRecord {
		return new PackageSetInfoRecord(desc);
	}

	public get id(): string {
		return this.name;
	}
}

export type PackageTargetInfoRecordProps = RunnerPackageTargetInfo & { id: string; };

export class PackageTargetInfoRecord extends ImmuRecord<PackageTargetInfoRecordProps>({

	compiler_id: "",
	compiler_version: "",
	id: "",
	dir: "",
	system_name: "",
	system_processor: ""

}) {
	public static fromDescription(id: string, desc: RunnerPackageTargetInfo): PackageTargetInfoRecord {
		return new PackageTargetInfoRecord({ id, ...desc });
	}
}

export type PackageInfoRecordProps = Omit<RunnerPackageInfo, "datafiles" | "patchers" | "sets" | "targets"> & {
	datafiles: ImmuList<PackageDataFileInfoRecord>;
	patchers: ImmuList<PackagePatcherInfoRecord>;
	sets: ImmuList<PackageSetInfoRecord>;
	targets: ImmuMap<string, PackageTargetInfoRecord>;
};

export class PackageInfoRecord extends ImmuRecord<PackageInfoRecordProps>({

	datafiles: ImmuList(),
	name: "",
	patchers: ImmuList(),
	rnbo_version: "",
	runner_version: "",
	schema_version: 1,
	sets: ImmuList(),
	targets: ImmuMap()

}) {

	public static fromDescription(desc: RunnerPackageInfo): PackageInfoRecord {
		return new PackageInfoRecord({
			datafiles: ImmuList((desc.datafiles || []).map(d => PackageDataFileInfoRecord.fromDescription(d))),
			name: desc.name,
			patchers: ImmuList((desc.patchers || []).map(p => PackagePatcherInfoRecord.fromDescription(p))),
			rnbo_version: desc.rnbo_version,
			runner_version: desc.runner_version,
			schema_version: desc.schema_version,
			sets: ImmuList((desc.sets || []).map(s => PackageSetInfoRecord.fromDescription(s))),
			targets: ImmuMap<string, PackageTargetInfoRecord>().withMutations(map => {
				for (const [id, targetDesc] of Object.entries(desc.targets)) {
					map.set(id, PackageTargetInfoRecord.fromDescription(id, targetDesc));
				}
			})
		});
	}

	public supportsRNBOVersion(version: string | RunnerInfoRecord): boolean {
		if (version instanceof RunnerInfoRecord) {
			return version.oscType === "s" && this.rnbo_version === version.oscValue;
		}

		return this.rnbo_version === version;
	}

	public supportsTarget(target: string | RunnerInfoRecord): boolean {
		if (!this.targets.size) return true; // no binaries included, works on any target.

		if (target instanceof RunnerInfoRecord) {
			return target.oscType === "s" && this.targets.has(target.oscValue as string);
		}

		return this.targets.has(target);
	}
}
