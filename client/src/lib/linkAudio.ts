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
