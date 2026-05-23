import { describe, it, expect } from 'vitest';
import { currentSpeed, currentTolerance, detentsActive } from './difficulty';
import { makeInitialState, startRun } from '../state';

const run = (elapsed: number) => {
	const s = startRun(makeInitialState());
	return { ...s, run: { ...s.run, elapsed } };
};

describe('currentSpeed', () => {
	it('returns v0 at t=0', () => {
		expect(currentSpeed(run(0))).toBe(5);
	});
	it('ramps linearly to vmax at T_ramp', () => {
		expect(currentSpeed(run(45))).toBeCloseTo(12.5, 5);
		expect(currentSpeed(run(90))).toBe(20);
	});
	it('clamps at vmax beyond T_ramp', () => {
		expect(currentSpeed(run(180))).toBe(20);
	});
});

describe('currentTolerance', () => {
	it('returns easy tolerance before T_tight', () => {
		expect(currentTolerance(run(0))).toBe(25);
		expect(currentTolerance(run(44))).toBe(25);
	});
	it('returns hard tolerance at and after T_tight', () => {
		expect(currentTolerance(run(45))).toBe(8);
		expect(currentTolerance(run(120))).toBe(8);
	});
	it('adds upgrade tolerance bonus', () => {
		const s = run(0);
		s.upgrades.toleranceBonus = 3;
		expect(currentTolerance(s)).toBe(25 + 3 * 2);
	});
});

describe('detentsActive', () => {
	it('is true before T_smooth, false after', () => {
		expect(detentsActive(run(0))).toBe(true);
		expect(detentsActive(run(19))).toBe(true);
		expect(detentsActive(run(20))).toBe(false);
	});
	it('extends by notchedDifficultyDelay × 5 seconds per upgrade level', () => {
		const s = run(22);
		s.upgrades.notchedDifficultyDelay = 1;
		expect(detentsActive(s)).toBe(true); // 22 < 20 + 5
		s.run.elapsed = 26;
		expect(detentsActive(s)).toBe(false); // 26 >= 25
	});
});
