import { dirname, join, resolve } from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { readPkgInfoVersion } from "./utils.mjs";

const { readFileSync, writeFileSync, rmSync, copySync } = fs;

const debian = process.argv.includes("--debian");
const arch = process.argv.at(-3);
const outdir = process.argv.at(-2);
const target = process.argv.at(-1);

const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverdir = join(basedir, "server");
const name = process.env.PKG_NAME || "rnbo-runner-panel";

// cleanup if we have an existing export
rmSync(join(outdir, "usr"), { recursive: true, force: true });

copySync(join(basedir, "client/out"), join(outdir, "usr", "share", name, "www"), { overwrite: true } );
copySync(join(serverdir, "templates"), join(outdir, "usr", "share", name, "templates"), { overwrite: true } );
copySync(join(serverdir, "Rocket.toml"), join(outdir, "usr", "share", name, "Rocket.toml"), { overwrite: true } );
copySync(join(serverdir, "target", target, "release", name), join(outdir, "usr", "bin", name), { overwrite: true } );

// do debian specific packaging
if (debian) {
	const version = process.env.PKG_VERSION || readPkgInfoVersion(join(basedir, "package.json"));

	// add the version and architecture into the control file
	const control = readFileSync(join(basedir, "config/debian/DEBIAN", "control.in"), "utf8").replace(/[\s\n]*$/, "") +
		`\nVersion: ${version}` +
		`\nArchitecture: ${arch}` +
		"\n"
	;
	writeFileSync(join(outdir, "DEBIAN", "control"), control);
	rmSync(join(outdir, "DEBIAN", "control.in"));

	const deb = `${name}_${version}_${arch}.deb`;
	execSync(`dpkg-deb --build . ../${deb}`, { cwd: outdir });
	console.log(`created ${deb}`);
}
