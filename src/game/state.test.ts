import { describe, it, expect } from 'vitest';
import { makeInitialState, type GameState } from './state';
import { TUNING } from './tuning';

describe('makeInitialState', () => {
	it('returns an idle state with empty world', () => {
		const s: GameState = makeInitialState();
		expect(s.run.status).toBe('idle');
		expect(s.run.elapsed).toBe(0);
		expect(s.run.score).toBe(0);
		expect(s.run.streak).toBe(0);
		expect(s.player.lane).toBe(1);
		expect(s.player.hue).toBe(0);
		expect(s.barriers).toEqual([]);
		expect(s.pickups).toEqual([]);
		expect(s.activePowerups).toEqual([]);
		expect(s.nextId).toBe(1);
		expect(s.rng).toBeTypeOf('function');
	});

	it('respects passed-in upgrades and rng', () => {
		const s = makeInitialState({
			upgrades: { toleranceBonus: 2, rotationCostReduction: 1, notchedDifficultyDelay: 3 },
			rng: () => 0.5
		});
		expect(s.upgrades.toleranceBonus).toBe(2);
		expect(s.rng()).toBe(0.5);
	});

	it('exposes tuning by reference', () => {
		const s = makeInitialState();
		expect(s.tuning).toBe(TUNING);
	});
});
