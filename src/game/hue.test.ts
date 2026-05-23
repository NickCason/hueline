import { describe, it, expect } from 'vitest';
import { hueDistance, normalizeHue, snapToDetents } from './hue';

describe('normalizeHue', () => {
	it('wraps positives into [0, 360)', () => {
		expect(normalizeHue(0)).toBe(0);
		expect(normalizeHue(360)).toBe(0);
		expect(normalizeHue(720)).toBe(0);
		expect(normalizeHue(540)).toBe(180);
	});
	it('wraps negatives into [0, 360)', () => {
		expect(normalizeHue(-10)).toBe(350);
		expect(normalizeHue(-360)).toBe(0);
		expect(normalizeHue(-540)).toBe(180);
	});
});

describe('hueDistance', () => {
	it('is zero for identical hues', () => {
		expect(hueDistance(0, 0)).toBe(0);
		expect(hueDistance(120, 120)).toBe(0);
	});
	it('measures shortest arc', () => {
		expect(hueDistance(10, 20)).toBe(10);
		expect(hueDistance(170, 190)).toBe(20);
	});
	it('handles the 0/360 seam correctly', () => {
		expect(hueDistance(355, 5)).toBe(10);
		expect(hueDistance(5, 355)).toBe(10);
		expect(hueDistance(-5, 5)).toBe(10);
	});
	it('caps at 180 (max arc)', () => {
		expect(hueDistance(0, 180)).toBe(180);
		expect(hueDistance(0, 181)).toBe(179);
	});
});

describe('snapToDetents', () => {
	it('snaps to multiples of 360/detents', () => {
		expect(snapToDetents(0, 8)).toBe(0);
		expect(snapToDetents(44, 8)).toBe(45);
		expect(snapToDetents(46, 8)).toBe(45);
		expect(snapToDetents(67, 8)).toBe(45);
		expect(snapToDetents(68, 8)).toBe(90);
		expect(snapToDetents(359, 8)).toBe(0);
	});
});
