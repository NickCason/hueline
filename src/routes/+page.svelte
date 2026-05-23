<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { loadProgress } from '../storage/progress';

	let highScore = $state(0);
	let currency = $state(0);

	onMount(() => {
		const p = loadProgress();
		highScore = p.highScore;
		currency = p.currency;
	});
</script>

<main class="title">
	<h1>Hueline</h1>
	<p class="tagline">Match the hue. Break the wall.</p>
	<div class="stats">
		<div>Best <strong>{highScore.toLocaleString()}</strong></div>
		<div>Chroma <strong>{currency.toLocaleString()}</strong></div>
	</div>
	<div class="actions">
		<button onclick={() => goto(`${base}/play`)}>Play</button>
		<button onclick={() => goto(`${base}/shop`)}>Shop</button>
	</div>
</main>

<style>
	.title {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 2rem;
	}
	h1 {
		font-size: 4rem;
		margin: 0;
		background: linear-gradient(90deg, #ff007a, #00f0ff, #aaff00);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		letter-spacing: -0.04em;
	}
	.tagline {
		opacity: 0.7;
	}
	.stats {
		display: flex;
		gap: 2rem;
		font-size: 0.9rem;
		opacity: 0.8;
	}
	.stats strong {
		display: block;
		font-size: 1.4rem;
		color: #00f0ff;
	}
	.actions {
		display: flex;
		gap: 1rem;
	}
	.actions button {
		padding: 0.75rem 2rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
	}
	.actions button:hover {
		background: rgba(255, 255, 255, 0.16);
	}
</style>
