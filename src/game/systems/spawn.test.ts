import { describe, it, expect } from 'vitest';
import { spawnTick, SPAWN_Z, SPAWN_GAP } from './spawn';
import { startRun, makeInitialState } from '../state';

const seqRng = (...values: number[]) => {
	let i = 0;
	return () => values[i++ % values.length];
};

describe('spawnTick', () => {
	it('seeds the pipeline when empty', () => {
		const s = { ...startRun(makeInitialState()), rng: seqRng(0.5, 0.5, 0.99, 0.5, 0.5, 0.99) };
		const s2 = spawnTick(s, 0);
		expect(s2.barriers.length).toBeGreaterThan(0);
		expect(s2.barriers[0].z).toBe(SPAWN_Z);
	});

	it('appends a new barrier when the leading edge advances past SPAWN_GAP', () => {
		const s = { ...startRun(makeInitialState()), rng: seqRng(0.5, 0.5, 0.99) };
		let s2 = spawnTick(s, 0);
		const before = s2.barriers.length;
		s2 = { ...s2, barriers: s2.barriers.map((b) => ({ ...b, z: b.z - SPAWN_GAP - 0.01 })) };
		const s3 = spawnTick(s2, 0);
		expect(s3.barriers.length).toBe(before + 1);
		expect(s3.barriers[s3.barriers.length - 1].z).toBe(SPAWN_Z);
	});

	it('drops a powerup pickup when rng[powerup] falls under tuning.powerupDropP', () => {
		const s = { ...startRun(makeInitialState()), rng: seqRng(0.5, 0.5, 0.01, 0.0) };
		const s2 = spawnTick(s, 0);
		expect(s2.pickups.length).toBeGreaterThan(0);
		expect(s2.pickups[0].kind).toBe('slowMo');
	});

	it('does not drop a powerup when rng[powerup] >= tuning.powerupDropP', () => {
		const s = { ...startRun(makeInitialState()), rng: seqRng(0.5, 0.5, 0.99) };
		const s2 = spawnTick(s, 0);
		expect(s2.pickups.length).toBe(0);
	});

	it('uses current difficulty tolerance for new barriers', () => {
		const s = {
			...startRun(makeInitialState()),
			rng: seqRng(0.5, 0.5, 0.99),
			run: { status: 'running' as const, elapsed: 50, score: 0, streak: 0 }
		};
		const s2 = spawnTick(s, 0);
		expect(s2.barriers[0].tolerance).toBe(8);
	});
});
