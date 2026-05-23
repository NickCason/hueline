import type { GameState } from '../state';

export function currentSpeed(s: GameState): number {
	const { v0, vmax, T_ramp } = s.tuning;
	const t = Math.min(s.run.elapsed, T_ramp);
	return v0 + (vmax - v0) * (t / T_ramp);
}

export function currentTolerance(s: GameState): number {
	const base = s.run.elapsed >= s.tuning.T_tight ? s.tuning.toleranceHard : s.tuning.toleranceEasy;
	return base + s.upgrades.toleranceBonus * 2;
}

export function detentsActive(s: GameState): boolean {
	const threshold = s.tuning.T_smooth + s.upgrades.notchedDifficultyDelay * 5;
	return s.run.elapsed < threshold;
}
