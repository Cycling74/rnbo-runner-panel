import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from 'url';
import { execSync } from "child_process";

const name = "rnbo-runner-panel";

const basedir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const debian = path.join(path.resolve(basedir, "debian"));
const version = JSON.parse(fs.readFileSync(path.join(basedir, 'package.json')))["version"];

//add the version into the control file
const control = fs.readFileSync(path.join(debian, "DEBIAN", "control.in"), 'utf8').replace(/[\s\n]*$/, '') + `\nVersion: ${version}\n`;
fs.writeFileSync(path.join(debian, "DEBIAN", "control"), control);

//cleanup if we have an existing export
fs.rmSync(path.join(debian, "usr"), { recursive: true, force: true });
fs.copySync(path.join(basedir, "out"), path.join(debian, "usr", "share", name, "www"), { overwrite: true } );

const deb = `${name}_${version}.deb`;

execSync(`dpkg-deb --build . ../${deb}`, { cwd: debian });
console.log(`created ${deb}`);
