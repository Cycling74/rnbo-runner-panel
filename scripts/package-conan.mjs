import { execSync } from "child_process";
import { readPkgInfoVersion } from "./utils.mjs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.env.PKG_VERSION || readPkgInfoVersion(join(basedir, "package.json"));
const tag = "c74/testing";

execSync(`conan create . ${version}@${tag}`);
