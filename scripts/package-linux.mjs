import { dirname, join, resolve } from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { readPkgInfoVersion } from "./utils.mjs";

const { readFileSync, writeFileSync, rmSync, copySync } = fs;

const debian = process.argv.includes("--debian");
const outdir = process.argv.at(-1);

const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const name = process.env.PKG_NAME || "rnbo-runner-panel";

// cleanup if we have an existing export
rmSync(join(outdir, "usr"), { recursive: true, force: true });

copySync(join(basedir, "out"), join(outdir, "usr", "share", name, "www"), { overwrite: true } );
copySync(join(basedir, "server.py"), join(outdir, "usr", "bin", name), { overwrite: true } );

//do debian specific packaging
if (debian) {
	const version = process.env.PKG_VERSION || readPkgInfoVersion(join(basedir, "package.json"));
	// add the version into the control file
	const control = readFileSync(join(outdir, "DEBIAN", "control.in"), "utf8").replace(/[\s\n]*$/, "") + `\nVersion: ${version}\n`;
	writeFileSync(join(outdir, "DEBIAN", "control"), control);

	const deb = `${name}_${version}.deb`;
	execSync(`dpkg-deb --build . ../${deb}`, { cwd: outdir });
	console.log(`created ${deb}`);
}
