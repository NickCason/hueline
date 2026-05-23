import * as THREE from 'three';
import { makeParticleBurst } from '../materials/particle-burst';

type Burst = { mesh: THREE.Points; mat: THREE.ShaderMaterial; born: number; ttl: number };

export function makeParticlesLayer(): {
	object: THREE.Object3D;
	emit: (pos: THREE.Vector3, hue: number, t: number) => void;
	tick: (t: number) => void;
} {
	const group = new THREE.Group();
	const bursts: Burst[] = [];
	const PARTICLES = 32;

	const emit = (pos: THREE.Vector3, hue: number, t: number) => {
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(PARTICLES * 3);
		const velocities = new Float32Array(PARTICLES * 3);
		const births = new Float32Array(PARTICLES);
		for (let i = 0; i < PARTICLES; i++) {
			positions[i * 3 + 0] = pos.x;
			positions[i * 3 + 1] = pos.y;
			positions[i * 3 + 2] = pos.z;
			const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
				.normalize()
				.multiplyScalar(2 + Math.random() * 3);
			velocities[i * 3 + 0] = dir.x;
			velocities[i * 3 + 1] = dir.y;
			velocities[i * 3 + 2] = dir.z;
			births[i] = t;
		}
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
		geo.setAttribute('birth', new THREE.BufferAttribute(births, 1));

		const mat = makeParticleBurst({ hue });
		mat.uniforms.uTime.value = t;
		const mesh = new THREE.Points(geo, mat);
		group.add(mesh);
		bursts.push({ mesh, mat, born: t, ttl: 0.7 });
	};

	const tick = (t: number) => {
		for (let i = bursts.length - 1; i >= 0; i--) {
			const b = bursts[i];
			b.mat.uniforms.uTime.value = t;
			if (t - b.born > b.ttl) {
				group.remove(b.mesh);
				b.mesh.geometry.dispose();
				b.mat.dispose();
				bursts.splice(i, 1);
			}
		}
	};

	return { object: group, emit, tick };
}
