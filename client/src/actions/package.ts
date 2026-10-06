import { installPackageOnRunner } from "../controller/cmd";
import { AppThunk } from "../lib/store";
import { RunnerInstallPackageResult } from "../lib/types";
import { loadGraphSetByNameOnRemote, setInitialGraphOnRemote } from "./sets";

export type PackagePostUploadConfig = {
	loadGraph?: string;
	setInitialGraph?: string;
};

export const installPackageOnRemote = (filename: string, config: PackagePostUploadConfig = {}): AppThunk<Promise<RunnerInstallPackageResult>> =>
	async (dispatch) => {
		const result = await installPackageOnRunner(filename);

		if (config.setInitialGraph) {
			dispatch(setInitialGraphOnRemote(config.setInitialGraph));
		}
		if (config.loadGraph) {
			dispatch(loadGraphSetByNameOnRemote(config.loadGraph));
		}

		return result;
	};
