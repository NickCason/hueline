import * as THREE from 'three';
import { makeTunnelEdges } from '../geometry/tunnel';
import { makeNeonEdge } from '../materials/neon-edge';

export function makeTunnelLayer(): { object: THREE.Object3D; tick: (t: number) => void } {
	const geo = makeTunnelEdges({
		halfWidth: 6,
		height: 4,
		depth: 130,
		rings: 32
	});
	const mat = makeNeonEdge({ color: '#00e5ff', intensity: 1.0 });
	const obj = new THREE.LineSegments(geo, mat);
	return {
		object: obj,
		tick: (t) => {
			mat.uniforms.uTime.value = t;
		}
	};
}
