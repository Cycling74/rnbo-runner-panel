import { PatcherExportRecord } from "../models/patcher";

export type PatcherGroup = {
	// "A", or "C–F" for a range of merged initials
	label: string;
	patchers: PatcherExportRecord[];
};

// Anything that isn't a letter shares one bucket, so numbered and symbol-prefixed exports don't
// each claim an initial of their own.
const OTHER_KEY = "#";

const initialOf = (name: string): string => {
	const c = name.trim().charAt(0).toUpperCase();
	return c >= "A" && c <= "Z" ? c : OTHER_KEY;
};

// Bucket by first letter, then merge adjacent buckets while they fit, so a letter with many
// patchers keeps a category to itself while sparse letters collapse into a range. Greedy and
// left-to-right: predictable, and stable as the list grows.
//
// `targetSize` is a soft cap. A single initial holding more than that stays oversized rather than
// being split, since there is nothing to split it on.
export const groupPatchersByName = (patchers: PatcherExportRecord[], targetSize: number): PatcherGroup[] => {

	if (!patchers.length) return [];

	const cap = Math.max(1, Math.floor(targetSize));

	// preserves the caller's sort, so buckets come out in display order
	const buckets: Array<{ key: string; patchers: PatcherExportRecord[] }> = [];
	for (const patcher of patchers) {
		const key = initialOf(patcher.name);
		const last = buckets[buckets.length - 1];
		if (last && last.key === key) {
			last.patchers.push(patcher);
		} else {
			buckets.push({ key, patchers: [patcher] });
		}
	}

	const groups: PatcherGroup[] = [];
	let firstKey = buckets[0].key;
	let lastKey = firstKey;
	let current: PatcherExportRecord[] = [];

	const flush = () => {
		if (!current.length) return;
		groups.push({
			label: firstKey === lastKey ? firstKey : `${firstKey}–${lastKey}`,
			patchers: current
		});
		current = [];
	};

	for (const bucket of buckets) {
		// start a new group when this bucket won't fit, unless the group is still empty (a single
		// oversized initial has to go somewhere)
		if (current.length && current.length + bucket.patchers.length > cap) {
			flush();
			firstKey = bucket.key;
		}
		if (!current.length) firstKey = bucket.key;
		current = current.concat(bucket.patchers);
		lastKey = bucket.key;
	}
	flush();

	return groups;
};
