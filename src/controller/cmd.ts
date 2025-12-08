import { RunnerCmdReadMethod, RunnerCmdResultCode } from "../lib/constants";
import { oscQueryBridge, RunnerCmd } from "./oscqueryBridgeController";
import { RunnerInstallPackageResponse, RunnerInstallPackageResult } from "../lib/types";

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

