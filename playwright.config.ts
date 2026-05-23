import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	timeout: 30_000,
	fullyParallel: false,
	webServer: {
		command: 'npm run dev -- --port 4173',
		url: 'http://localhost:4173',
		reuseExistingServer: true,
		timeout: 30_000
	},
	use: {
		baseURL: 'http://localhost:4173',
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 2
	},
	projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 5'] } }]
});
