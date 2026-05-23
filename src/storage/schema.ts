import { z } from 'zod';

export const ProgressSchemaV1 = z.object({
	version: z.literal(1),
	highScore: z.number().int().nonnegative(),
	currency: z.number().int().nonnegative(),
	upgrades: z.object({
		toleranceBonus: z.number().int().min(0).max(10),
		rotationCostReduction: z.number().int().min(0).max(10),
		notchedDifficultyDelay: z.number().int().min(0).max(10)
	}),
	cosmetics: z.object({
		unlocked: z.array(z.string()),
		equipped: z.object({
			orb: z.string(),
			tunnel: z.string()
		})
	})
});

export type Progress = z.infer<typeof ProgressSchemaV1>;
