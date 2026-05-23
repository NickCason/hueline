<script lang="ts">
	import type { GameState } from '../game/state';
	import DialIndicator from './DialIndicator.svelte';

	type Props = { state: GameState };
	let { state }: Props = $props();
</script>

<div class="hud">
	<div class="score">{state.run.score.toLocaleString()}</div>
	<div class="dial-wrap"><DialIndicator hue={state.player.hue} /></div>
	<div class="chips">
		{#each state.activePowerups as p (p.kind)}
			<div class="chip {p.kind}">{p.kind}</div>
		{/each}
	</div>
</div>

<style>
	.hud {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: #fff;
		font:
			600 16px/1 system-ui,
			sans-serif;
	}
	.score {
		position: absolute;
		top: 16px;
		left: 16px;
		font-size: 28px;
		text-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
	}
	.dial-wrap {
		position: absolute;
		top: 16px;
		right: 16px;
	}
	.chips {
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 8px;
	}
	.chip {
		padding: 4px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		text-transform: uppercase;
		font-size: 11px;
		letter-spacing: 0.1em;
	}
	.chip.slowMo {
		box-shadow: 0 0 12px rgba(180, 180, 255, 0.6);
	}
	.chip.gradient {
		box-shadow: 0 0 12px rgba(255, 200, 80, 0.6);
	}
	.chip.magnet {
		box-shadow: 0 0 12px rgba(80, 255, 180, 0.6);
	}
</style>
