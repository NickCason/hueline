export type Barrier = {
	id: number;
	z: number; // distance from player; 0 = at player plane
	targetHue: number; // 0..360
	tolerance: number; // half-width in degrees
	gradient?: { from: number; to: number }; // present iff gradient powerup applied
};

export type PowerupKind = 'slowMo' | 'gradient' | 'magnet';

export type PowerupPickup = {
	id: number;
	z: number;
	kind: PowerupKind;
};

export type ActivePowerup = {
	kind: PowerupKind;
	remaining: number;
};

export type RunStatus = 'idle' | 'running' | 'gameOver';

export type RunState = {
	status: RunStatus;
	elapsed: number;
	score: number;
	streak: number;
};

export type PlayerState = {
	hue: number; // normalized 0..360
};
