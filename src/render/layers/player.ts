import * as THREE from 'three';
import { makeOrb } from '../geometry/orb';
import { makeOrbGlow } from '../materials/orb-glow';
import type { PlayerState } from '../../game/components';

export function makePlayerLayer(): {
	object: THREE.Object3D;
	sync: (p: PlayerState, t: number, dt: number) => void;
} {
	const geo = makeOrb({ radius: 0.4, detail: 2 });
	const mat = makeOrbGlow({ hue: 0 });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.position.set(0, 0.6, 0);

	return {
		object: mesh,
		sync: (p, t, _dt) => {
			mat.uniforms.uHue.value = p.hue;
			mat.uniforms.uTime.value = t;
		}
	};
}
