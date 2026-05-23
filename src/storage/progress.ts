// Safe localStorage adapter: validates & recovers from corrupt/missing data via Zod schema
import { ProgressSchemaV1, type Progress } from './schema';

const KEY = 'hueline.progress';

export const DEFAULT_PROGRESS: Progress = {
	version: 1,
	highScore: 0,
	currency: 0,
	upgrades: {
		toleranceBonus: 0,
		rotationCostReduction: 0,
		notchedDifficultyDelay: 0
	},
	cosmetics: {
		unlocked: ['orb-default', 'tunnel-default'],
		equipped: { orb: 'orb-default', tunnel: 'tunnel-default' }
	}
};

export function loadProgress(storage: Storage = localStorage): Progress {
	const raw = storage.getItem(KEY);
	if (!raw) return DEFAULT_PROGRESS;
	try {
		const parsed = JSON.parse(raw);
		const result = ProgressSchemaV1.safeParse(parsed);
		if (!result.success) {
			console.warn('[hueline] progress failed schema, resetting:', result.error.issues);
			return DEFAULT_PROGRESS;
		}
		return result.data;
	} catch (e) {
		console.warn('[hueline] progress JSON unreadable, resetting:', e);
		return DEFAULT_PROGRESS;
	}
}

export function saveProgress(storage: Storage = localStorage, p: Progress): void {
	storage.setItem(KEY, JSON.stringify(p));
}

export { type Progress };
