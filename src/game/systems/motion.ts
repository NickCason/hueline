import type { GameState } from '../state';
import { currentSpeed } from './difficulty';

export function currentTimeScale(s: GameState): number {
	let scale = 1;
	for (const p of s.activePowerups) {
		if (p.kind === 'slowMo') scale *= s.tuning.powerups.slowMo.timeScale;
	}
	return scale;
}

export function motionTick(state: GameState, dt: number): GameState {
	if (state.run.status !== 'running') return state;
	const dz = currentSpeed(state) * dt * currentTimeScale(state);
	return {
		...state,
		barriers: state.barriers.map((b) => ({ ...b, z: b.z - dz })),
		pickups: state.pickups.map((p) => ({ ...p, z: p.z - dz })),
		run: { ...state.run, elapsed: state.run.elapsed + dt }
	};
}
