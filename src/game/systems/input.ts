import type { GameState } from '../state';
import { normalizeHue } from '../hue';

export type Intent = { type: 'hue'; deltaDeg: number };

export function applyInput(state: GameState, intents: Intent[]): GameState {
	if (state.run.status !== 'running' || intents.length === 0) return state;

	let hue = state.player.hue;
	for (const i of intents) {
		hue = normalizeHue(hue + i.deltaDeg);
	}

	if (hue === state.player.hue) return state;
	return { ...state, player: { hue } };
}
