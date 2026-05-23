import * as THREE from 'three';
import type { Barrier } from '../../game/components';
import { makeRingFrame } from '../geometry/ring';
import { makeGlassIridescent } from '../materials/glass-iridescent';
import { makeBarrierGradient } from '../materials/barrier-gradient';

type Pool = Map<number, THREE.Mesh>;

const RING_OUTER_W = 11;
const RING_OUTER_H = 7;
const RING_THICKNESS = 0.7;

export function makeBarriersLayer(): {
	object: THREE.Object3D;
	sync: (barriers: Barrier[], t: number) => void;
} {
	const group = new THREE.Group();
	const pool: Pool = new Map();

	const sync = (barriers: Barrier[], t: number) => {
		const seenIds = new Set<number>();
		for (const b of barriers) {
			seenIds.add(b.id);
			let mesh = pool.get(b.id);
			if (!mesh) {
				const geo = makeRingFrame({
					outerW: RING_OUTER_W,
					outerH: RING_OUTER_H,
					thickness: RING_THICKNESS
				});
				const mat = b.gradient
					? makeBarrierGradient({ from: b.gradient.from, to: b.gradient.to })
					: makeGlassIridescent({ hue: b.targetHue });
				mesh = new THREE.Mesh(geo, mat);
				pool.set(b.id, mesh);
				group.add(mesh);
			}
			// Frame is centered around the orb's y-line (0.6) and at the barrier's z.
			mesh.position.set(0, 0.6, b.z);
			const u = (mesh.material as THREE.ShaderMaterial).uniforms;
			if (u.uTime) u.uTime.value = t;
		}
		for (const [id, mesh] of pool) {
			if (!seenIds.has(id)) {
				group.remove(mesh);
				mesh.geometry.dispose();
				(mesh.material as THREE.Material).dispose();
				pool.delete(id);
			}
		}
	};

	return { object: group, sync };
}
