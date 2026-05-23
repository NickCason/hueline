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
        float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
        float irid = sin(uTime * 0.6 + fresnel * 12.0) * 0.5 + 0.5;
        vec3 baseHsv = vec3(uHue / 360.0, 0.55, 0.95);
        vec3 base = hsv2rgb(baseHsv);
        vec3 iridColor = hsv2rgb(vec3(mod(uHue / 360.0 + irid * 0.15, 1.0), 0.6, 1.0));
        vec3 color = mix(base, iridColor, fresnel);
        gl_FragColor = vec4(color, mix(uOpacity, 0.95, fresnel));
      }
    `
	});
}
