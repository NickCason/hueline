import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TUNING } from '../game/tuning';

export type RenderContext = {
	renderer: THREE.WebGLRenderer;
	composer: EffectComposer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	root: THREE.Group;
	resize: (w: number, h: number) => void;
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
		75,
		canvas.clientWidth / canvas.clientHeight,
		0.1,
		200
	);
	camera.position.set(0, 3.5, -10);
	camera.lookAt(0, 0.5, 30);

	const root = new THREE.Group();
	scene.add(root);

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(
		new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
		0.9,
		0.6,
		0.0
	);
	composer.addPass(bloom);

	const resize = (w: number, h: number) => {
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	};

	const dispose = () => {
		renderer.dispose();
		composer.dispose();
		scene.traverse((obj) => {
			const mesh = obj as THREE.Mesh;
			if (mesh.geometry) mesh.geometry.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
			if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
			else mat?.dispose();
		});
	};

	void TUNING;

	return { renderer, composer, scene, camera, root, resize, dispose };
}
