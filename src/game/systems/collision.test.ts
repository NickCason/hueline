import { describe, it, expect } from 'vitest';
import { collisionTick } from './collision';
import { startRun, makeInitialState } from '../state';

const playerAt = (hue: number) => {
	const s = startRun(makeInitialState());
	s.player.hue = hue;
	return s;
};

describe('collisionTick', () => {
	it('does nothing if no barrier has reached z=0', () => {
		const s = playerAt(0);
		s.barriers.push({ id: 1, z: 1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.barriers.length).toBe(1);
		expect(s2.run.status).toBe('running');
	});

	it('breaks barrier when hue within tolerance', () => {
		const s = playerAt(5);
		s.barriers.push({ id: 1, z: -0.1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.barriers.length).toBe(0);
		expect(s2.run.score).toBeGreaterThan(0);
		expect(s2.run.streak).toBe(1);
		expect(s2.run.status).toBe('running');
	});

	it('ends run when hue out of tolerance', () => {
		const s = playerAt(90);
		s.barriers.push({ id: 1, z: -0.1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('gameOver');
	});

	it('matches against gradient span when barrier has gradient', () => {
		const s = playerAt(100);
		s.barriers.push({
			id: 1,
			z: -0.1,
			targetHue: 0,
			tolerance: 5,
			gradient: { from: 80, to: 140 }
		});
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('running');
		expect(s2.barriers.length).toBe(0);
	});

	it('magnet powerup forgives near-misses within snapRadius', () => {
		const s = playerAt(15);
		s.activePowerups.push({ kind: 'magnet', remaining: 2 });
		s.barriers.push({ id: 1, z: -0.1, targetHue: 0, tolerance: 5 });
		const s2 = collisionTick(s, 0);
		expect(s2.run.status).toBe('running');
	});

	it('decrements gradient powerup count on each barrier resolution', () => {
		const s = playerAt(0);
		s.activePowerups.push({ kind: 'gradient', remaining: 2 });
		s.barriers.push({ id: 1, z: -0.1, targetHue: 0, tolerance: 25 });
		const s2 = collisionTick(s, 0);
		expect(s2.activePowerups.find((a) => a.kind === 'gradient')?.remaining).toBe(1);
	});
});
