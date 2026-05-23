export function normalizeHue(h: number): number {
	return ((h % 360) + 360) % 360;
}

/**
 * Shortest arc between two hues on the color wheel.
 * @param a First hue (0-360, wraps automatically)
 * @param b Second hue (0-360, wraps automatically)
 * @returns Distance in degrees (0-180)
 */
export function hueDistance(a: number, b: number): number {
	const d = Math.abs(normalizeHue(a) - normalizeHue(b));
	return Math.min(d, 360 - d);
}

export function snapToDetents(h: number, detents: number): number {
	const step = 360 / detents;
	const normalized = normalizeHue(h);
	const snapped = Math.round(normalized / step) * step;
	return normalized === 0 ? 0 : normalizeHue(snapped);
}
