import * as THREE from 'three';

export function makeBarrierGradient(opts: {
	from: number;
	to: number;
	opacity?: number;
}): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide,
		uniforms: {
			uFrom: { value: opts.from },
			uTo: { value: opts.to },
			uOpacity: { value: opts.opacity ?? 0.85 }
		},
		vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uFrom;
      uniform float uTo;
      uniform float uOpacity;
      varying vec2 vUv;
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      void main() {
        float span = mod(uTo - uFrom + 360.0, 360.0);
        float h = mod(uFrom + vUv.x * span, 360.0) / 360.0;
        vec3 color = hsv2rgb(vec3(h, 0.55, 0.95));
        gl_FragColor = vec4(color, uOpacity);
      }
    `
	});
}
