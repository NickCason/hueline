import { describe, it, expect } from 'vitest';
import { applyInput, type Intent } from './input';
import { makeInitialState, startRun } from '../state';
import { snapToDetents, normalizeHue } from '../hue';

describe('applyInput', () => {
	it('clamps lane changes to [0,2]', () => {
		let s = startRun(makeInitialState());
		s = applyInput(s, [{ type: 'lane', delta: -1 }]);
		expect(s.player.lane).toBe(0);
		s = applyInput(s, [{ type: 'lane', delta: -1 }]);
		expect(s.player.lane).toBe(0);
		s = applyInput(s, [
			{ type: 'lane', delta: 1 },
			{ type: 'lane', delta: 1 },
			{ type: 'lane', delta: 1 }
		]);
		expect(s.player.lane).toBe(2);
	});

	it('rotates hue continuously after detent threshold', () => {
		const s0 = {
			...startRun(makeInitialState()),
			run: { status: 'running', elapsed: 100, score: 0, streak: 0 } as const
		};
		const s1 = applyInput(s0, [{ type: 'hue', deltaDeg: 13.4 }]);
		expect(s1.player.hue).toBeCloseTo(13.4, 5);
	});

	it('snaps hue to detents during low-difficulty window', () => {
		const s0 = startRun(makeInitialState()); // elapsed 0, before T_smooth
		const s1 = applyInput(s0, [{ type: 'hue', deltaDeg: 13.4 }]);
		expect(s1.player.hue).toBe(snapToDetents(13.4, 8));
	});

	it('wraps hue across the 0/360 seam', () => {
		let s = startRun(makeInitialState());
		s = { ...s, run: { ...s.run, elapsed: 100 } };
		s = applyInput(s, [{ type: 'hue', deltaDeg: 350 }]);
		s = applyInput(s, [{ type: 'hue', deltaDeg: 20 }]);
		expect(s.player.hue).toBeCloseTo(normalizeHue(370), 5);
	});

	it('ignores input when run status is not running', () => {
		let s = makeInitialState(); // idle
		s = applyInput(s, [
			{ type: 'lane', delta: 1 },
			{ type: 'hue', deltaDeg: 90 }
		]);
		expect(s.player.lane).toBe(1);
		expect(s.player.hue).toBe(0);
	});
});
