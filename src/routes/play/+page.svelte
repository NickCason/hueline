<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import GameCanvas from '../../lib/GameCanvas.svelte';
	import Hud from '../../lib/Hud.svelte';
	import { loadProgress } from '../../storage/progress';
	import type { GameState } from '../../game/state';
	import type { Upgrades } from '../../game/state';

	let gameState: GameState | null = $state(null);
	let upgrades: Upgrades = $state({
		toleranceBonus: 0,
		rotationCostReduction: 0,
		notchedDifficultyDelay: 0
	});

	onMount(() => {
		upgrades = loadProgress().upgrades;
	});

	function onGameOver(s: GameState) {
		sessionStorage.setItem(
			'hueline.lastRun',
			JSON.stringify({ score: s.run.score, elapsed: s.run.elapsed })
		);
		goto(`${base}/results`);
	}
</script>

<div class="stage">
	<GameCanvas {upgrades} ontick={(s) => (gameState = s)} ongameOver={onGameOver} />
	{#if gameState}<Hud state={gameState} />{/if}
</div>

<style>
	.stage {
		position: fixed;
		inset: 0;
	}
</style>
