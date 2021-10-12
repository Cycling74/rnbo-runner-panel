import { dirname, join, resolve } from "path";
import { readFileSync, writeFileSync, rmSync, copySync } from "fs-extra";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const debian = join(resolve(basedir, "debian"));

const readPkgInfoVersion = fpath => {
	const info = JSON.parse(readFileSync(fpath, { encoding: "utf8"} ));
	if (!info.version) throw new Error("Missing version property in pacakge.json file");
	return info.version;
};

const name = process.env.PKG_NAME || "rnbo-runner-panel";
const version = process.env.PKG_VERSION || readPkgInfoVersion(join(basedir, "package.json"));

// add the version into the control file
const control = readFileSync(join(debian, "DEBIAN", "control.in"), "utf8").replace(/[\s\n]*$/, "") + `\nVersion: ${version}\n`;
writeFileSync(join(debian, "DEBIAN", "control"), control);

// cleanup if we have an existing export
rmSync(join(debian, "usr"), { recursive: true, force: true });
copySync(join(basedir, "out"), join(debian, "usr", "share", name, "www"), { overwrite: true } );

const deb = `${name}_${version}.deb`;

execSync(`dpkg-deb --build . ../${deb}`, { cwd: debian });
console.log(`created ${deb}`);
