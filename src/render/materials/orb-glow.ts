import * as THREE from 'three';

export function makeOrbGlow(opts: { hue: number }): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: {
			uHue: { value: opts.hue },
			uTime: { value: 0 }
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
      varying vec3 vNormal;
      varying vec3 vView;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec3 base = hsv2rgb(vec3(uHue / 360.0, 0.95, 0.85));
        float ndv = max(dot(vNormal, vView), 0.0);
        float rim = pow(1.0 - ndv, 2.0);
        // Solid base color across the body; rim adds a white-ish glow halo only at the silhouette edge.
        vec3 color = base + vec3(0.6) * rim;
        gl_FragColor = vec4(color, mix(0.95, 0.85, ndv));
      }
    `
	});
}
