import { describe, it, expect } from 'vitest';
import { motionTick, currentTimeScale } from './motion';
import { startRun, makeInitialState } from '../state';
import { currentSpeed } from './difficulty';

describe('currentTimeScale', () => {
	it('is 1 with no active powerups', () => {
		const s = startRun(makeInitialState());
		expect(currentTimeScale(s)).toBe(1);
	});
	it('multiplies tuning.powerups.slowMo.timeScale when slowMo is active', () => {
		const s = startRun(makeInitialState());
		s.activePowerups.push({ kind: 'slowMo', remaining: 2 });
		expect(currentTimeScale(s)).toBeCloseTo(0.4);
	});
});

describe('motionTick', () => {
	it('advances barriers and pickups toward the player at currentSpeed × dt × timeScale', () => {
		const s = startRun(makeInitialState());
		const dt = 0.1;
		s.barriers.push({ id: 1, z: 50, lane: 1, targetHue: 0, tolerance: 25 });
		s.pickups.push({ id: 2, z: 40, lane: 0, kind: 'slowMo' });
		const s2 = motionTick(s, dt);
		const delta = currentSpeed(s) * dt;
		expect(s2.barriers[0].z).toBeCloseTo(50 - delta);
		expect(s2.pickups[0].z).toBeCloseTo(40 - delta);
	});
	it('does nothing if status is not running', () => {
		const s = makeInitialState();
		s.barriers.push({ id: 1, z: 50, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = motionTick(s, 0.1);
		expect(s2.barriers[0].z).toBe(50);
	});
});
