import fs from "fs-extra";
const { readFileSync } = fs;

export const readPkgInfoVersion = fpath => {
	const info = JSON.parse(readFileSync(fpath, { encoding: "utf8"} ));
	if (!info.version) throw new Error("Missing version property in pacakge.json file");
	return info.version;
};
