import * as THREE from 'three';

export function makeGlassIridescent(opts: { hue: number; opacity?: number }): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide,
		uniforms: {
			uHue: { value: opts.hue },
			uTime: { value: 0 },
			uOpacity: { value: opts.opacity ?? 0.85 }
		},
		vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
		fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uHue;
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.5);
        float shimmer = sin(uTime * 1.2 + fresnel * 8.0) * 0.5 + 0.5;
        vec3 baseHsv = vec3(uHue / 360.0, 0.90, 0.85);
        vec3 base = hsv2rgb(baseHsv);
        // Shimmer is a brightness boost layered on top, not a hue shift.
        vec3 highlight = base + vec3(0.25) * shimmer * fresnel;
        vec3 color = mix(base, highlight, fresnel * 0.7);
        gl_FragColor = vec4(color, mix(uOpacity, 0.9, fresnel * 0.5));
      }
    `
	});
}
