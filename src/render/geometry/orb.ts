import * as THREE from 'three';

export function makeOrb(opts: { radius: number; detail?: number }): THREE.IcosahedronGeometry {
	return new THREE.IcosahedronGeometry(opts.radius, opts.detail ?? 2);
}
