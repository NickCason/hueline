import type { GameState } from '../state';
import type { ActivePowerup } from '../components';

const PLAYER_Z = 0; // pickups at z <= PLAYER_PICKUP_THRESHOLD are collected
const PICKUP_THRESHOLD = 0.5;

function durationFor(s: GameState, kind: ActivePowerup['kind']): number {
	switch (kind) {
		case 'slowMo':
			return s.tuning.powerups.slowMo.duration;
		case 'magnet':
			return s.tuning.powerups.magnet.duration;
		case 'gradient':
			return s.tuning.powerups.gradient.barrierCount;
	}
}

export function powerupTick(state: GameState, dt: number): GameState {
	if (state.run.status !== 'running') return state;

	// 1. Collect or drop pickups
	let active = state.activePowerups;
	const remainingPickups = [];
	for (const p of state.pickups) {
		const collected =
			p.lane === state.player.lane && p.z <= PICKUP_THRESHOLD && p.z >= PLAYER_Z - 5;
		if (collected) {
			const existing = active.find((a) => a.kind === p.kind);
			const fresh = durationFor(state, p.kind);
			if (existing) {
				active = active.map((a) => (a.kind === p.kind ? { ...a, remaining: fresh } : a));
			} else {
				active = [...active, { kind: p.kind, remaining: fresh }];
			}
		} else if (p.z > PLAYER_Z - 5) {
			// Keep only pickups still in front of, or at, the player. Anything past −5 is dead weight.
			remainingPickups.push(p);
		}
	}

	// 2. Decay time-based powerups (gradient is barrier-counted and decremented by collision system)
	active = active
		.map((a) => (a.kind === 'gradient' ? a : { ...a, remaining: a.remaining - dt }))
		.filter((a) => a.remaining > 0);

	return { ...state, pickups: remainingPickups, activePowerups: active };
}
