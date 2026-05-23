import type { GameState } from './state';
import { applyInput, type Intent } from './systems/input';
import { spawnTick } from './systems/spawn';
import { motionTick } from './systems/motion';
import { powerupTick } from './systems/powerup';
import { collisionTick } from './systems/collision';

const DT_MAX = 0.1;

export function tick(state: GameState, dt: number, intents: Intent[]): GameState {
	if (state.run.status !== 'running') return state;
	const clamped = Math.min(dt, DT_MAX);
	let s = state;
	s = applyInput(s, intents);
	s = spawnTick(s, clamped);
	s = motionTick(s, clamped);
	s = powerupTick(s, clamped);
	s = collisionTick(s, clamped);
	return s;
}
