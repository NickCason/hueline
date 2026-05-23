import * as THREE from 'three';
import { makeOrb } from '../geometry/orb';
import { makeGlassIridescent } from '../materials/glass-iridescent';
import { TUNING } from '../../game/tuning';
import type { PlayerState } from '../../game/components';

export function makePlayerLayer(): {
	object: THREE.Object3D;
	sync: (p: PlayerState, t: number) => void;
} {
	const geo = makeOrb({ radius: 0.4, detail: 2 });
	const mat = makeGlassIridescent({ hue: 0, opacity: 0.9 });
	const mesh = new THREE.Mesh(geo, mat);
	const laneWidth = 12 / TUNING.laneCount;

	return {
		object: mesh,
		sync: (p, t) => {
			const xCenter = -6 + laneWidth * (p.lane + 0.5);
			mesh.position.set(xCenter, 0.6, 0);
			mat.uniforms.uHue.value = p.hue;
			mat.uniforms.uTime.value = t;
		}
	};
}
