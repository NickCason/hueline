import * as THREE from 'three';
import type { Barrier } from '../../game/components';
import { makeBarrierPlane } from '../geometry/barrier';
import { makeGlassIridescent } from '../materials/glass-iridescent';
import { makeBarrierGradient } from '../materials/barrier-gradient';
import { TUNING } from '../../game/tuning';

type Pool = Map<number, THREE.Mesh>;

export function makeBarriersLayer(): {
	object: THREE.Object3D;
	sync: (barriers: Barrier[], t: number) => void;
} {
	const group = new THREE.Group();
	const pool: Pool = new Map();
	const laneWidth = 12 / TUNING.laneCount;

	const sync = (barriers: Barrier[], t: number) => {
		const seenIds = new Set<number>();
		for (const b of barriers) {
			seenIds.add(b.id);
			let mesh = pool.get(b.id);
			if (!mesh) {
				const geo = makeBarrierPlane({ width: laneWidth * 0.92, height: 1.2 });
				const mat = b.gradient
					? makeBarrierGradient({ from: b.gradient.from, to: b.gradient.to })
					: makeGlassIridescent({ hue: b.targetHue });
				mesh = new THREE.Mesh(geo, mat);
				pool.set(b.id, mesh);
				group.add(mesh);
			}
			const xCenter = -6 + laneWidth * (b.lane + 0.5);
			mesh.position.set(xCenter, 0.6, b.z);
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
