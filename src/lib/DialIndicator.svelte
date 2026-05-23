<script lang="ts">
	type Props = {
		hue?: number;
		size?: number;
	};
	let { hue = 0, size = 72 }: Props = $props();
</script>

<div class="dial" style="--size:{size}px; --hue:{hue}deg">
	<div class="ring"></div>
	<div class="needle"></div>
</div>

<style>
	.dial {
		width: var(--size);
		height: var(--size);
		position: relative;
	}
	.ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
		-webkit-mask: radial-gradient(circle, transparent 50%, black 52%);
		mask: radial-gradient(circle, transparent 50%, black 52%);
		opacity: 0.85;
	}
	.needle {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 3px;
		height: calc(var(--size) * 0.4);
		background: #fff;
		transform-origin: 50% 100%;
		transform: translate(-50%, -100%) rotate(var(--hue));
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
	}
</style>
