import * as THREE from 'three';

export function makeParticleBurst(opts: { hue: number }): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		uniforms: {
			uHue: { value: opts.hue },
			uTime: { value: 0 }
		},
		vertexShader: /* glsl */ `
      attribute vec3 velocity;
      attribute float birth;
      uniform float uTime;
      varying float vAge;
      void main() {
        float age = uTime - birth;
        vec3 p = position + velocity * age;
        vAge = clamp(age / 1.0, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = mix(14.0, 1.0, vAge);
      }
    `,
		fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uHue;
      varying float vAge;
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        vec3 color = hsv2rgb(vec3(uHue / 360.0, 0.6, 1.0));
        gl_FragColor = vec4(color, (1.0 - vAge) * (1.0 - d * 2.0));
      }
    `
	});
}
