import * as THREE from 'three';

export function makeBarrierPlane(opts: { width: number; height: number }): THREE.PlaneGeometry {
	return new THREE.PlaneGeometry(opts.width, opts.height, 1, 1);
}
