export type LaneIndex = 0 | 1 | 2;

export type Barrier = {
	id: number;
	z: number; // distance from player; 0 = at player plane
	lane: LaneIndex;
	targetHue: number; // 0..360
	tolerance: number; // half-width in degrees
	gradient?: { from: number; to: number }; // present iff gradient powerup applied
};

export type PowerupKind = 'slowMo' | 'gradient' | 'magnet';

export type PowerupPickup = {
	id: number;
	z: number;
	lane: LaneIndex;
	kind: PowerupKind;
};

export type ActivePowerup = {
	kind: PowerupKind;
	remaining: number; // seconds for slowMo/magnet; barrier-count for gradient
};

export type RunStatus = 'idle' | 'running' | 'gameOver';

export type RunState = {
	status: RunStatus;
	elapsed: number; // seconds since run start
	score: number;
	streak: number;
};

export type PlayerState = {
	lane: LaneIndex;
	hue: number; // normalized 0..360
};
