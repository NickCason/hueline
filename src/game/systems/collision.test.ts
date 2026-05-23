import { describe, it, expect } from 'vitest';
import { collisionTick } from './collision';
import { startRun, makeInitialState } from '../state';

const playerAt = (lane: 0 | 1 | 2, hue: number) => {
	const s = startRun(makeInitialState());
	s.player.lane = lane;
	s.player.hue = hue;
	return s;
};

describe('collisionTick', () => {
	it('does nothing if no barrier has reached z=0', () => {
		const s = playerAt(1, 0);
		s.barriers.push({ id: 1, z: 1, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.barriers.length).toBe(1);
		expect(s2.run.status).toBe('running');
	});

	it('breaks barrier when lane matches and hue within tolerance', () => {
		const s = playerAt(1, 5);
		s.barriers.push({ id: 1, z: -0.1, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.barriers.length).toBe(0);
		expect(s2.run.score).toBeGreaterThan(0);
		expect(s2.run.streak).toBe(1);
		expect(s2.run.status).toBe('running');
	});

	it('lets a barrier pass harmlessly when player is in a different lane', () => {
		const s = playerAt(0, 0);
		s.player.lane = 0;
		s.barriers.push({ id: 1, z: -0.1, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('running');
		expect(s2.barriers.length).toBe(0); // barrier consumed
	});

	it('ends run when player in lane but hue out of tolerance', () => {
		const s = playerAt(1, 90);
		s.barriers.push({ id: 1, z: -0.1, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('gameOver');
	});

	it('matches against gradient span when barrier has gradient', () => {
		const s = playerAt(1, 100);
		s.barriers.push({
			id: 1,
			z: -0.1,
			lane: 1,
			targetHue: 0,
			tolerance: 5,
			gradient: { from: 80, to: 140 }
		});
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('running');
		expect(s2.barriers.length).toBe(0);
	});

	it('magnet powerup forgives near-misses within snapRadius', () => {
		const s = playerAt(1, 15);
		s.activePowerups.push({ kind: 'magnet', remaining: 2 });
		s.barriers.push({ id: 1, z: -0.1, lane: 1, targetHue: 0, tolerance: 5 });
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('running');
	});

	it('decrements gradient powerup count on each barrier resolution', () => {
		const s = playerAt(1, 0);
		s.activePowerups.push({ kind: 'gradient', remaining: 2 });
		s.barriers.push({ id: 1, z: -0.1, lane: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.activePowerups.find((a) => a.kind === 'gradient')?.remaining).toBe(1);
	});
});
