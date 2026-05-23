import type { GameState } from '../state';
import type { LaneIndex, PowerupKind } from '../components';
import { currentTolerance } from './difficulty';

export const SPAWN_Z = 120;
export const SPAWN_GAP = 12;
const KINDS: PowerupKind[] = ['slowMo', 'gradient', 'magnet'];

export function spawnTick(state: GameState, _dt: number): GameState {
	if (state.run.status !== 'running') return state;

	let barriers = state.barriers;
	let pickups = state.pickups;
	let nextId = state.nextId;
	const tolerance = currentTolerance(state);

	// Seed pipeline if empty (~10 barriers stretching from player toward SPAWN_Z)
	if (barriers.length === 0) {
		const seeded: typeof barriers = [];
		for (let i = 0; i < 10; i++) {
			const lane = Math.floor(state.rng() * state.tuning.laneCount) as LaneIndex;
			const targetHue = state.rng() * 360;
			const powerupRoll = state.rng();
			seeded.push({
				id: nextId++,
				z: SPAWN_Z - i * SPAWN_GAP,
				lane,
				targetHue,
				tolerance
			});
			if (powerupRoll < state.tuning.powerupDropP) {
				const kindIdx = Math.min(Math.floor(state.rng() * KINDS.length), KINDS.length - 1);
				pickups = [
					...pickups,
					{ id: nextId++, z: SPAWN_Z - i * SPAWN_GAP - SPAWN_GAP / 2, lane, kind: KINDS[kindIdx] }
				];
			}
		}
		return { ...state, barriers: seeded, pickups, nextId };
	}

	// Append when the leading edge has moved more than SPAWN_GAP from SPAWN_Z
	const leadingZ = barriers[barriers.length - 1].z;
	if (SPAWN_Z - leadingZ < SPAWN_GAP) return state;

	const lane = Math.floor(state.rng() * state.tuning.laneCount) as LaneIndex;
	const targetHue = state.rng() * 360;
	const powerupRoll = state.rng();
	const newBarrier = { id: nextId++, z: SPAWN_Z, lane, targetHue, tolerance };
	barriers = [...barriers, newBarrier];

	if (powerupRoll < state.tuning.powerupDropP) {
		const kindIdx = Math.min(Math.floor(state.rng() * KINDS.length), KINDS.length - 1);
		pickups = [
			...pickups,
			{ id: nextId++, z: SPAWN_Z - SPAWN_GAP / 2, lane, kind: KINDS[kindIdx] }
		];
	}

	return { ...state, barriers, pickups, nextId };
}
