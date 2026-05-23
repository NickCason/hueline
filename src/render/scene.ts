import * as THREE from 'three';
import { TUNING } from '../game/tuning';

export type RenderContext = {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	root: THREE.Group;
	dispose: () => void;
};

export function makeRenderContext(canvas: HTMLCanvasElement): RenderContext {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
	renderer.setClearColor(0x000005, 1);

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x000005, 40, 130);

	const camera = new THREE.PerspectiveCamera(
		70,
		canvas.clientWidth / canvas.clientHeight,
		0.1,
		200
	);
	camera.position.set(0, 2.5, -6);
	camera.lookAt(0, 0.5, 30);

	const root = new THREE.Group();
	scene.add(root);

	const dispose = () => {
		renderer.dispose();
		scene.traverse((obj) => {
			const mesh = obj as THREE.Mesh;
			if (mesh.geometry) mesh.geometry.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
			if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
			else mat?.dispose();
		});
	};

	// Verify TUNING accessible (compile-time bind)
	void TUNING;

	return { renderer, scene, camera, root, dispose };
}
