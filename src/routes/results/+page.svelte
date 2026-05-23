<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { loadProgress, saveProgress, type Progress } from '../../storage/progress';

	let score = $state(0);
	let earned = $state(0);
	let best = $state(0);
	let isNewBest = $state(false);

	onMount(() => {
		const raw = sessionStorage.getItem('hueline.lastRun');
		if (!raw) {
			goto(`${base}/`);
			return;
		}
		const lastRun = JSON.parse(raw);
		score = lastRun.score;
		earned = Math.floor(score / 100);

		const p: Progress = loadProgress();
		best = Math.max(p.highScore, score);
		isNewBest = score > p.highScore;
		saveProgress(localStorage, {
			...p,
			highScore: best,
			currency: p.currency + earned
		});
	});
</script>

<main class="results">
	<h1>{isNewBest ? 'New Best!' : 'Run Over'}</h1>
	<div class="score">{score.toLocaleString()}</div>
	<p class="earned">+{earned} chroma</p>
	<p class="best">Best: {best.toLocaleString()}</p>
	<div class="actions">
		<button onclick={() => goto(`${base}/play`)}>Play Again</button>
		<button onclick={() => goto(`${base}/`)}>Title</button>
		<button onclick={() => goto(`${base}/shop`)}>Shop</button>
	</div>
</main>

<style>
	.results {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		margin: 0;
		color: #00f0ff;
	}
	.score {
		font-size: 4rem;
		font-weight: 700;
	}
	.earned {
		color: #aaff00;
	}
	.best {
		opacity: 0.7;
	}
	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
	.actions button {
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
	}
</style>
