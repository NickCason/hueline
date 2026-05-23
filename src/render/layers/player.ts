import * as THREE from 'three';
import { makeOrb } from '../geometry/orb';
import { makeOrbGlow } from '../materials/orb-glow';
import { TUNING } from '../../game/tuning';
import type { PlayerState } from '../../game/components';

export function makePlayerLayer(): {
	object: THREE.Object3D;
	sync: (p: PlayerState, t: number, dt: number) => void;
} {
	const geo = makeOrb({ radius: 0.4, detail: 2 });
	const mat = makeOrbGlow({ hue: 0 });
	const mesh = new THREE.Mesh(geo, mat);
	const laneWidth = 12 / TUNING.laneCount;

	// Smoothed lane position — eases toward the discrete lane index.
	let displayLane = 1; // start in middle

	return {
		object: mesh,
		sync: (p, t, dt) => {
			// Ease toward target lane; ~0.18 of the way per 16ms frame at this rate constant.
			const k = 1 - Math.exp(-dt * 14);
			displayLane += (p.lane - displayLane) * k;
			const xCenter = -6 + laneWidth * (displayLane + 0.5);
			mesh.position.set(xCenter, 0.6, 0);
			mat.uniforms.uHue.value = p.hue;
			mat.uniforms.uTime.value = t;
		}
	};
}
