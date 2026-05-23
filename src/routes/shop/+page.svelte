<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { loadProgress, saveProgress, type Progress } from '../../storage/progress';

	type UpgradeKey = 'toleranceBonus' | 'rotationCostReduction' | 'notchedDifficultyDelay';

	const UPGRADE_KEYS: UpgradeKey[] = [
		'toleranceBonus',
		'rotationCostReduction',
		'notchedDifficultyDelay'
	];
	const UPGRADE_LABELS: Record<UpgradeKey, { name: string; desc: string }> = {
		toleranceBonus: {
			name: 'Wider tolerance',
			desc: 'Each level adds +2° to barrier match windows.'
		},
		rotationCostReduction: {
			name: 'Eased dial',
			desc: 'Each level eases dial sensitivity for smoother control.'
		},
		notchedDifficultyDelay: {
			name: 'Detent grace',
			desc: 'Each level delays the smooth-dial threshold by 5s.'
		}
	};

	const PRICE = (lvl: number) => 50 * Math.pow(2, lvl);
	let p: Progress | null = $state(null);

	onMount(() => {
		p = loadProgress();
	});

	function grantChroma() {
		if (!p) return;
		p = { ...p, currency: p.currency + 100 };
		saveProgress(localStorage, p);
	}

	function buy(key: UpgradeKey) {
		if (!p) return;
		const lvl = p.upgrades[key];
		const cost = PRICE(lvl);
		if (lvl >= 10 || p.currency < cost) return;
		p = {
			...p,
			currency: p.currency - cost,
			upgrades: { ...p.upgrades, [key]: lvl + 1 }
		};
		saveProgress(localStorage, p);
	}

	function unlockCosmetic(id: string, slot: 'orb' | 'tunnel', cost: number) {
		if (!p) return;
		if (p.cosmetics.unlocked.includes(id) || p.currency < cost) {
			p = {
				...p,
				cosmetics: { ...p.cosmetics, equipped: { ...p.cosmetics.equipped, [slot]: id } }
			};
			saveProgress(localStorage, p);
			return;
		}
		p = {
			...p,
			currency: p.currency - cost,
			cosmetics: {
				unlocked: [...p.cosmetics.unlocked, id],
				equipped: { ...p.cosmetics.equipped, [slot]: id }
			}
		};
		saveProgress(localStorage, p);
	}
</script>

{#if p}
	<main class="shop">
		<header>
			<a href="{base}/">←</a>
			<h1>Shop</h1>
			<button class="grant" onclick={grantChroma}>+100</button>
			<div class="balance">{p.currency} chroma</div>
		</header>

		<section>
			<h2>Dial upgrades</h2>
			{#each UPGRADE_KEYS as key (key)}
				{@const meta = UPGRADE_LABELS[key]}
				{@const lvl = p.upgrades[key]}
				{@const cost = PRICE(lvl)}
				<div class="row">
					<div class="meta">
						<h3>{meta.name} <span class="lvl">Lv {lvl}/10</span></h3>
						<p>{meta.desc}</p>
					</div>
					<button disabled={lvl >= 10 || p.currency < cost} onclick={() => buy(key)}>
						{lvl >= 10 ? 'Maxed' : `Buy · ${cost}`}
					</button>
				</div>
			{/each}
		</section>

		<section>
			<h2>Cosmetics</h2>
			<div class="row">
				<div class="meta">
					<h3>Orb · Aurora</h3>
					<p>Cool-spectrum iridescent tint.</p>
				</div>
				<button onclick={() => unlockCosmetic('orb-aurora', 'orb', 200)}>
					{p.cosmetics.unlocked.includes('orb-aurora')
						? p.cosmetics.equipped.orb === 'orb-aurora'
							? 'Equipped'
							: 'Equip'
						: 'Buy · 200'}
				</button>
			</div>
			<div class="row">
				<div class="meta">
					<h3>Tunnel · Magenta Edge</h3>
					<p>Switches lane lines to a hot magenta neon.</p>
				</div>
				<button onclick={() => unlockCosmetic('tunnel-magenta', 'tunnel', 200)}>
					{p.cosmetics.unlocked.includes('tunnel-magenta')
						? p.cosmetics.equipped.tunnel === 'tunnel-magenta'
							? 'Equipped'
							: 'Equip'
						: 'Buy · 200'}
				</button>
			</div>
		</section>
	</main>
{/if}

<style>
	.shop {
		padding: 1rem 1.5rem 4rem;
		max-width: 540px;
		margin: 0 auto;
	}
	header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
	}
	header a {
		font-size: 1.5rem;
		text-decoration: none;
	}
	header h1 {
		font-size: 1.5rem;
		margin: 0;
		flex: 1;
	}
	.balance {
		color: #aaff00;
		font-weight: 600;
	}
	.grant {
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		background: rgba(255, 200, 80, 0.15);
		color: #ffc850;
		font-size: 0.75rem;
		min-width: 0;
		margin-right: 0.5rem;
	}
	.grant:hover {
		background: rgba(255, 200, 80, 0.25);
	}
	section h2 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.6;
		margin: 1.5rem 0 0.75rem;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
	.meta {
		flex: 1;
	}
	.meta h3 {
		font-size: 1rem;
		margin: 0 0 0.25rem;
	}
	.meta p {
		font-size: 0.85rem;
		opacity: 0.6;
		margin: 0;
	}
	.lvl {
		font-weight: 400;
		opacity: 0.5;
		font-size: 0.8rem;
	}
	button {
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: rgba(0, 240, 255, 0.18);
		color: #00f0ff;
		min-width: 84px;
	}
	button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
