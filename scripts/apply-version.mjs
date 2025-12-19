import { execSync } from "child_process";
import { readPkgInfoVersion } from "./utils.mjs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import fs from "fs-extra";
const { readFileSync, writeFileSync } = fs;

const packagename = "rnbo-runner-panel";
const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.env.PKG_VERSION || readPkgInfoVersion(join(basedir, "server", "package.json"));

// replace the first occurance of "version =" as it will be the package version
const cargofile = resolve(dirname(fileURLToPath(import.meta.url)), "..", "server", "Cargo.toml");
const contents = readFileSync(cargofile, { encoding: "utf8" });
writeFileSync(cargofile, contents.replace(/^version =.*$/m, `version = "${version}"`));

// update lockfile with that version
execSync(`cargo update --quiet ${packagename}`, { cwd: join(basedir, "server") });
