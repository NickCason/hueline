import { describe, it, expect } from 'vitest';
import { tick } from './loop';
import { startRun, makeInitialState } from './state';

describe('tick', () => {
	it('clamps dt to 0.1 seconds to avoid teleport on backgrounded tabs', () => {
		const s = startRun(makeInitialState());
		const s2 = tick(s, 5, []);
		expect(s2.run.elapsed).toBeLessThanOrEqual(0.11);
	});
	it('returns state unchanged when status is idle', () => {
		const s = makeInitialState();
		const s2 = tick(s, 0.016, []);
		expect(s2).toBe(s);
	});
	it('advances elapsed when running', () => {
		const s = startRun(makeInitialState());
		const s2 = tick(s, 0.016, []);
		expect(s2.run.elapsed).toBeCloseTo(0.016);
	});
});
