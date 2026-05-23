import * as THREE from 'three';

export function makeNeonEdge(opts: {
	color?: THREE.ColorRepresentation;
	intensity?: number;
}): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		uniforms: {
			uColor: { value: new THREE.Color(opts.color ?? '#00f0ff') },
			uIntensity: { value: opts.intensity ?? 1.4 },
			uTime: { value: 0 }
		},
		vertexShader: /* glsl */ `
      varying float vDist;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
		fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uTime;
      varying float vDist;
      void main() {
        float attenuation = clamp(1.0 - vDist / 140.0, 0.0, 1.0);
        float pulse = 0.85 + sin(uTime * 1.5) * 0.15;
        vec3 color = uColor * uIntensity * attenuation * pulse;
        gl_FragColor = vec4(color, attenuation);
      }
    `
	});
}
