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
	const PARTICLES = 64;

	const emit = (pos: THREE.Vector3, hue: number, t: number) => {
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(PARTICLES * 3);
		const velocities = new Float32Array(PARTICLES * 3);
		const births = new Float32Array(PARTICLES);
		for (let i = 0; i < PARTICLES; i++) {
			positions[i * 3 + 0] = pos.x;
			positions[i * 3 + 1] = pos.y;
			positions[i * 3 + 2] = pos.z;
			// Bias toward an outward ring in the XY plane (more theatrical shatter).
			const angle = (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.3;
			const ringR = 4 + Math.random() * 3;
			const zJitter = (Math.random() - 0.5) * 2.5;
			velocities[i * 3 + 0] = Math.cos(angle) * ringR;
			velocities[i * 3 + 1] = Math.sin(angle) * ringR;
			velocities[i * 3 + 2] = zJitter;
			births[i] = t;
		}
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
		geo.setAttribute('birth', new THREE.BufferAttribute(births, 1));

		const mat = makeParticleBurst({ hue });
		mat.uniforms.uTime.value = t;
		const mesh = new THREE.Points(geo, mat);
		group.add(mesh);
		bursts.push({ mesh, mat, born: t, ttl: 1.0 });
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
