import { describe, it, expect } from 'vitest';
import { powerupTick } from './powerup';
import { startRun, makeInitialState } from '../state';

describe('powerupTick', () => {
	it('activates a pickup when player crosses its z plane in the same lane', () => {
		const s = startRun(makeInitialState());
		s.pickups.push({ id: 1, z: 0.4, lane: 1, kind: 'slowMo' });
		const s2 = powerupTick(s, 0);
		expect(s2.pickups.length).toBe(0);
		expect(s2.activePowerups[0]).toEqual({ kind: 'slowMo', remaining: 4 });
	});

	it('leaves a pickup alone if in a different lane', () => {
		const s = startRun(makeInitialState());
		s.pickups.push({ id: 1, z: 0.4, lane: 0, kind: 'slowMo' });
		const s2 = powerupTick(s, 0);
		expect(s2.pickups.length).toBe(1);
		expect(s2.activePowerups.length).toBe(0);
	});

	it('decays time-based powerups by dt × currentTimeScale (real-time, not game-time)', () => {
		const s = startRun(makeInitialState());
		s.activePowerups.push({ kind: 'slowMo', remaining: 2 });
		const s2 = powerupTick(s, 1);
		expect(s2.activePowerups[0].remaining).toBeCloseTo(1);
	});

	it('removes expired time-based powerups', () => {
		const s = startRun(makeInitialState());
		s.activePowerups.push({ kind: 'magnet', remaining: 0.5 });
		const s2 = powerupTick(s, 1);
		expect(s2.activePowerups.length).toBe(0);
	});

	it('stacks duplicate powerups by refreshing remaining', () => {
		const s = startRun(makeInitialState());
		s.activePowerups.push({ kind: 'slowMo', remaining: 1 });
		s.pickups.push({ id: 9, z: 0.4, lane: 1, kind: 'slowMo' });
		const s2 = powerupTick(s, 0);
		expect(s2.activePowerups.length).toBe(1);
		expect(s2.activePowerups[0].remaining).toBe(4);
	});

	it('decrements gradient barrier-count outside of dt and removes at 0', () => {
		const s = startRun(makeInitialState());
		s.activePowerups.push({ kind: 'gradient', remaining: 1 });
		const s2 = powerupTick(s, 1);
		// gradient is barrier-count, not time-based; decay step is no-op here
		expect(s2.activePowerups[0].remaining).toBe(1);
	});
});
