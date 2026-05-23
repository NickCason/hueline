import * as THREE from 'three';

// A thick rectangular frame: outer rectangle minus inner rectangle.
// Returns extrude-friendly geometry — we'll use it as a plane-like flat ring.
export function makeRingFrame(opts: {
	outerW: number;
	outerH: number;
	thickness: number;
}): THREE.BufferGeometry {
	const { outerW, outerH, thickness } = opts;
	const ow = outerW / 2;
	const oh = outerH / 2;
	const iw = ow - thickness;
	const ih = oh - thickness;

	// 8 vertices: outer 4 + inner 4. Triangulate the frame as 4 strips (top, right, bottom, left).
	// Each strip is 2 triangles. Total 8 triangles. UVs map x→u in [0, 1] across the frame width
	// for the gradient material; we mostly care about a usable UV for gradient shaders.
	const positions = [
		// outer corners
		-ow,
		-oh,
		0, // 0 outer BL
		ow,
		-oh,
		0, // 1 outer BR
		ow,
		oh,
		0, // 2 outer TR
		-ow,
		oh,
		0, // 3 outer TL
		// inner corners
		-iw,
		-ih,
		0, // 4 inner BL
		iw,
		-ih,
		0, // 5 inner BR
		iw,
		ih,
		0, // 6 inner TR
		-iw,
		ih,
		0 // 7 inner TL
	];

	// UVs: just use angle around the frame for the gradient material (u = 0..1 going around).
	const uvs = [0.0, 0.0, 0.25, 0.0, 0.5, 1.0, 0.75, 1.0, 0.0, 0.0, 0.25, 0.0, 0.5, 1.0, 0.75, 1.0];

	// Indices forming the 4 strips of the frame
	const indices = [
		// bottom strip: 0,1,5 and 0,5,4
		0, 1, 5, 0, 5, 4,
		// right strip: 1,2,6 and 1,6,5
		1, 2, 6, 1, 6, 5,
		// top strip: 2,3,7 and 2,7,6
		2, 3, 7, 2, 7, 6,
		// left strip: 3,0,4 and 3,4,7
		3, 0, 4, 3, 4, 7
	];

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
	geo.setIndex(indices);
	geo.computeVertexNormals();
	return geo;
}
