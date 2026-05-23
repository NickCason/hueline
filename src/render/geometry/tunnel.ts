import * as THREE from 'three';

// Rectangular tunnel: outer ring frames spaced along z, plus four corner rails running depth.
export function makeTunnelEdges(opts: {
	halfWidth: number;
	height: number;
	depth: number;
	rings: number;
}): THREE.BufferGeometry {
	const { halfWidth, height, depth, rings } = opts;
	const positions: number[] = [];

	// Four corner rails running the full depth
	const corners: [number, number][] = [
		[-halfWidth, -height / 2],
		[halfWidth, -height / 2],
		[halfWidth, height / 2],
		[-halfWidth, height / 2]
	];
	for (const [x, y] of corners) {
		positions.push(x, y, 0, x, y, depth);
	}

	// Ring frames spaced along z
	for (let r = 0; r < rings; r++) {
		const z = (r / (rings - 1)) * depth;
		// Four edges per ring
		positions.push(-halfWidth, -height / 2, z, halfWidth, -height / 2, z);
		positions.push(halfWidth, -height / 2, z, halfWidth, height / 2, z);
		positions.push(halfWidth, height / 2, z, -halfWidth, height / 2, z);
		positions.push(-halfWidth, height / 2, z, -halfWidth, -height / 2, z);
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	return geo;
}
