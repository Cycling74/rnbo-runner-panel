import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

const basedir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(process.argv[2] || join(basedir, "release_body.md"));

// Consume Published Packages via ENV var
// In the Release flow this is done via the changesets output
const publishedPackagesRaw = process.env.PUBLISHED_PACKAGES;
if (!publishedPackagesRaw) {
	throw new Error("PUBLISHED_PACKAGES environment variable is required");
}

const publishedPackages = JSON.parse(publishedPackagesRaw);

const packages = [
	{ name: "@rnbo-runner-panel/server", label: "Server", changelog: "server/CHANGELOG.md" },
	{ name: "@rnbo-runner-panel/client", label: "Client", changelog: "client/CHANGELOG.md" }
];

async function extractSection(file, version) {
	const contents = await readFile(file, "utf8");
	const header = `## ${version}`;
	const lines = contents.split("\n");
	const out = [];

	// Parse out section for given version
	// by consuming each line of the given changelog
	let found = false;
	for (const line of lines) {
		if (!found) {
			if (line === header) found = true;
			continue;
		}
		if (line.startsWith("## ")) break;
		out.push(line);
	}

	if (!found) {
		throw new Error(`could not find section "${header}" in ${file}`);
	}

	return out.join("\n").trim();
}

const sections = [];
for (const pkg of packages) {
	const published = publishedPackages.find(p => p.name === pkg.name);
	if (!published) continue;
	const section = await extractSection(join(basedir, pkg.changelog), published.version);
	sections.push(`## ${pkg.label}\n\n${section}`);
}

await writeFile(outputPath, sections.join("\n\n") + "\n");
console.log(`Wrote release notes to ${outputPath}`);
