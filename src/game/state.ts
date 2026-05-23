import type { Barrier, PowerupPickup, ActivePowerup, RunState, PlayerState } from './components';
import { TUNING, type Tuning } from './tuning';

export type Upgrades = {
	toleranceBonus: number;
	rotationCostReduction: number;
	notchedDifficultyDelay: number;
};

export type GameState = {
	tuning: Tuning;
	run: RunState;
	player: PlayerState;
	barriers: Barrier[];
	pickups: PowerupPickup[];
	activePowerups: ActivePowerup[];
	upgrades: Upgrades;
	nextId: number;
	rng: () => number; // [0, 1)
};

export type InitOptions = Partial<{
	upgrades: Upgrades;
	rng: () => number;
}>;

const DEFAULT_UPGRADES: Upgrades = {
	toleranceBonus: 0,
	rotationCostReduction: 0,
	notchedDifficultyDelay: 0
};

export function makeInitialState(opts: InitOptions = {}): GameState {
	return {
		tuning: TUNING,
		run: { status: 'idle', elapsed: 0, score: 0, streak: 0 },
		player: { hue: 0 },
		barriers: [],
		pickups: [],
		activePowerups: [],
		upgrades: opts.upgrades ?? DEFAULT_UPGRADES,
		nextId: 1,
		rng: opts.rng ?? Math.random
	};
}

export function startRun(s: GameState): GameState {
	return {
		...s,
		run: { status: 'running', elapsed: 0, score: 0, streak: 0 },
		player: { hue: 0 },
		barriers: [],
		pickups: [],
		activePowerups: []
	};
}
