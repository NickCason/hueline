import type { GameState } from '../state';
import type { LaneIndex } from '../components';
import { normalizeHue, snapToDetents } from '../hue';

export type Intent = { type: 'lane'; delta: -1 | 1 } | { type: 'hue'; deltaDeg: number };

export function applyInput(state: GameState, intents: Intent[]): GameState {
	if (state.run.status !== 'running' || intents.length === 0) return state;

	let lane = state.player.lane;
	let hue = state.player.hue;
	const detentsActive =
		state.run.elapsed < state.tuning.T_smooth + state.upgrades.notchedDifficultyDelay * 5;

	for (const i of intents) {
		if (i.type === 'lane') {
			const next = lane + i.delta;
			if (next >= 0 && next <= state.tuning.laneCount - 1) lane = next as LaneIndex;
		} else {
			hue = normalizeHue(hue + i.deltaDeg);
		}
	}

	if (detentsActive) hue = snapToDetents(hue, state.tuning.detents);

	if (lane === state.player.lane && hue === state.player.hue) return state;
	return { ...state, player: { lane, hue } };
}
