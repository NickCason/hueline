// tuning knobs — playtest these freely
export const TUNING = {
	v0: 5,
	vmax: 20,
	T_ramp: 90,
	T_smooth: 20,
	T_tight: 45,
	toleranceEasy: 25,
	toleranceHard: 8,
	basePoints: 100,
	maxBonusGain: 0.5,
	powerupDropP: 0.05,
	detents: 8,
	powerups: {
		slowMo: { duration: 4, timeScale: 0.4 },
		gradient: { barrierCount: 3 },
		magnet: { duration: 3, snapRadius: 10 }
	}
} as const;

export type Tuning = typeof TUNING;
