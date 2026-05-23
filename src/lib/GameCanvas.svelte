<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { makeRenderContext } from '../render/scene';
	import { makeSyncContext } from '../render/sync';
	import { tick } from '../game/loop';
	import { startRun, makeInitialState, type GameState } from '../game/state';
	import type { Intent } from '../game/systems/input';
	import type { Upgrades } from '../game/state';

	type Props = {
		upgrades?: Upgrades;
		ontick?: (state: GameState) => void;
		ongameOver?: (state: GameState) => void;
	};

	let {
		upgrades = {
			toleranceBonus: 0,
			rotationCostReduction: 0,
			notchedDifficultyDelay: 0
		},
		ontick,
		ongameOver
	}: Props = $props();

	let canvasEl: HTMLCanvasElement;
	let state: GameState = $state(untrack(() => startRun(makeInitialState({ upgrades }))));
	let intents: Intent[] = [];
	let rafHandle = 0;
	let lastTs = 0;
	let paused = false;
	let dispose: (() => void) | null = null;

	function onKey(e: KeyboardEvent) {
		if (state.run.status !== 'running') return;
		switch (e.key) {
			case 'ArrowLeft':
				intents.push({ type: 'lane', delta: -1 });
				e.preventDefault();
				break;
			case 'ArrowRight':
				intents.push({ type: 'lane', delta: 1 });
				e.preventDefault();
				break;
			case 'ArrowUp':
				intents.push({ type: 'hue', deltaDeg: 12 });
				e.preventDefault();
				break;
			case 'ArrowDown':
				intents.push({ type: 'hue', deltaDeg: -12 });
				e.preventDefault();
				break;
		}
	}

	let touchStart: { x: number; y: number } | null = null;
	function onTouchStart(e: TouchEvent) {
		e.preventDefault();
		const t = e.touches[0];
		touchStart = { x: t.clientX, y: t.clientY };
	}
	function onTouchMove(e: TouchEvent) {
		if (!touchStart) return;
		e.preventDefault();
		const t = e.touches[0];
		const dx = t.clientX - touchStart.x;
		const dy = t.clientY - touchStart.y;
		if (Math.abs(dx) > 48) {
			intents.push({ type: 'lane', delta: dx > 0 ? 1 : -1 });
			touchStart = { x: t.clientX, y: t.clientY };
		}
		if (Math.abs(dy) > 4) {
			intents.push({ type: 'hue', deltaDeg: -dy * 1.5 });
			touchStart = { x: t.clientX, y: t.clientY };
		}
	}
	function onTouchEnd() {
		touchStart = null;
	}

	onMount(() => {
		const ctx = makeRenderContext(canvasEl);
		const syncCtx = makeSyncContext(ctx);
		dispose = ctx.dispose;

		const resize = () => {
			const w = canvasEl.clientWidth,
				h = canvasEl.clientHeight;
			ctx.resize(w, h);
		};
		window.addEventListener('resize', resize);

		const onContextLost = (e: Event) => {
			e.preventDefault();
			paused = true;
		};
		const onContextRestored = () => {
			paused = false;
			lastTs = 0;
		};
		canvasEl.addEventListener('webglcontextlost', onContextLost);
		canvasEl.addEventListener('webglcontextrestored', onContextRestored);

		const loop = (ts: number) => {
			if (!paused) {
				const dt = lastTs === 0 ? 0 : (ts - lastTs) / 1000;
				lastTs = ts;
				const next = tick(state, dt, intents);
				intents = [];
				if (next.run.status === 'gameOver' && state.run.status === 'running') {
					ongameOver?.(next);
				}
				state = next;
				syncCtx.sync(state, ts / 1000);
				ctx.composer.render();
				ontick?.(state);
			}
			rafHandle = requestAnimationFrame(loop);
		};
		rafHandle = requestAnimationFrame(loop);

		window.addEventListener('keydown', onKey);
		canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
		canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
		canvasEl.addEventListener('touchend', onTouchEnd);

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', onKey);
			canvasEl.removeEventListener('webglcontextlost', onContextLost);
			canvasEl.removeEventListener('webglcontextrestored', onContextRestored);
		};
	});

	onDestroy(() => {
		cancelAnimationFrame(rafHandle);
		dispose?.();
	});
</script>

<canvas bind:this={canvasEl} class="game"></canvas>

<style>
	.game {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}
</style>
