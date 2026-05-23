import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Hueline',
				short_name: 'Hueline',
				description: 'Match the hue. Break the wall.',
				theme_color: '#000005',
				background_color: '#000005',
				display: 'standalone',
				orientation: 'portrait',
				scope: './',
				start_url: './',
				icons: [
					{ src: './icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: './icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: './icon-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}']
			}
		})
	]
});
