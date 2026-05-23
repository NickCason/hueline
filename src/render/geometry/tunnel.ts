import * as THREE from 'three';

// Square-ish tunnel cross-section with lane divisions visible as edges.
// Returns line segments suitable for a LineSegments mesh with the neon-edge material.
export function makeTunnelEdges(opts: {
	lanes: number;
	halfWidth: number;
	height: number;
	depth: number;
	rings: number;
}): THREE.BufferGeometry {
	const { lanes, halfWidth, height, depth, rings } = opts;
	const laneStep = (halfWidth * 2) / lanes;
	const positions: number[] = [];

	// Longitudinal rails (lane dividers, top, bottom)
	for (let i = 0; i <= lanes; i++) {
		const x = -halfWidth + laneStep * i;
		positions.push(x, -height / 2, 0, x, -height / 2, depth);
		positions.push(x, height / 2, 0, x, height / 2, depth);
	}
	// Ring frames spaced along z
	for (let r = 0; r < rings; r++) {
		const z = (r / (rings - 1)) * depth;
		positions.push(-halfWidth, -height / 2, z, halfWidth, -height / 2, z);
		positions.push(-halfWidth, height / 2, z, halfWidth, height / 2, z);
		positions.push(-halfWidth, -height / 2, z, -halfWidth, height / 2, z);
		positions.push(halfWidth, -height / 2, z, halfWidth, height / 2, z);
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	return geo;
}
