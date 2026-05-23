import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const svg = await readFile('static/icon.svg');

await Promise.all([
	sharp(svg).resize(192, 192).png().toFile('static/icon-192.png'),
	sharp(svg).resize(512, 512).png().toFile('static/icon-512.png'),
	// Maskable icon: pad to avoid edge cropping
	sharp(svg)
		.resize(360, 360)
		.extend({ top: 76, bottom: 76, left: 76, right: 76, background: '#000005' })
		.png()
		.toFile('static/icon-maskable.png')
]);

console.log('icons generated');
