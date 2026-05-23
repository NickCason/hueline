import type { GameState } from '../state';
import type { Barrier } from '../components';
import { hueDistance } from '../hue';
import { currentSpeed } from './difficulty';

function withinGradient(hue: number, g: { from: number; to: number }): boolean {
	// Treat gradient as an arc from `from` to `to` going +hue direction.
	const span = (((g.to - g.from) % 360) + 360) % 360;
	const offset = (((hue - g.from) % 360) + 360) % 360;
	return offset <= span;
}

export function collisionTick(state: GameState, _dt: number): GameState {
	if (state.run.status !== 'running') return state;

	const arrived: Barrier[] = [];
	const remaining: Barrier[] = [];
	for (const b of state.barriers) {
		if (b.z <= 0) arrived.push(b);
		else remaining.push(b);
	}
	if (arrived.length === 0) return state;

	let score = state.run.score;
	let streak = state.run.streak;
	let active = state.activePowerups;
	const magnet = active.find((a) => a.kind === 'magnet');
	const magnetR = magnet ? state.tuning.powerups.magnet.snapRadius : 0;

	for (const b of arrived) {
		let matched = false;
		if (b.gradient) {
			matched = withinGradient(state.player.hue, b.gradient);
		} else {
			const d = hueDistance(state.player.hue, b.targetHue);
			matched = d <= b.tolerance + magnetR;
		}
		if (!matched) {
			return {
				...state,
				run: { ...state.run, status: 'gameOver', streak: 0 },
				activePowerups: active
			};
		}
		// Decrement gradient powerup on barrier resolution
		active = active
			.map((a) => (a.kind === 'gradient' ? { ...a, remaining: a.remaining - 1 } : a))
			.filter((a) => a.remaining > 0);
		// Score
		const d = b.gradient ? 0 : hueDistance(state.player.hue, b.targetHue);
		const speedMult = currentSpeed(state) / state.tuning.v0;
		const toleranceBonus = b.gradient
			? 1
			: 1 + (1 - Math.min(d, b.tolerance) / b.tolerance) * state.tuning.maxBonusGain;
		streak += 1;
		const streakBonus = Math.min(streak * 0.05, 1.0);
		const breakScore = state.tuning.basePoints * speedMult * toleranceBonus;
		score += Math.round(breakScore * (1 + streakBonus));
	}

	return {
		...state,
		barriers: remaining,
		activePowerups: active,
		run: { ...state.run, score, streak }
	};
}
