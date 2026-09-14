// Reorder writes the whole key list back, with the moved slot swapped with its neighbour.
// Returns the list unchanged (identity-equal) when the move isn't possible, so callers can skip
// the round trip.
export const swapped = (keys: string[], key: string, delta: number): string[] => {
	const from = keys.indexOf(key);
	const to = from + delta;
	if (from < 0 || to < 0 || to >= keys.length) return keys;
	const next = keys.slice();
	next[from] = keys[to];
	next[to] = key;
	return next;
};

// Move `key` within `subset`, then write the result back into `all`.
//
// jack_transport_link keeps ONE order list for every source, but a Receive device shows only one
// peer's slots. Moving a slot inside that device has to permute the peer's keys among the index
// positions they already occupy in the global list, leaving every other peer's entry exactly
// where it was. Reordering the subset and concatenating would reshuffle the whole session.
//
// `subset` must list its keys in the same relative order they appear in `all` — which is how
// getLinkDevices builds slotKeys, by filtering the published order.
//
// Returns `all` unchanged (identity-equal) when the move isn't possible, so callers can skip the
// round trip.
export const swappedWithin = (all: string[], subset: string[], key: string, delta: number): string[] => {
	const nextSubset = swapped(subset, key, delta);
	if (nextSubset === subset) return all;

	const positions = subset.map(k => all.indexOf(k));
	// a subset key missing from the global list means the two are out of sync; don't guess
	if (positions.some(i => i < 0)) return all;
	positions.sort((a, b) => a - b);

	const next = all.slice();
	positions.forEach((pos, i) => { next[pos] = nextSubset[i]; });
	return next;
};
