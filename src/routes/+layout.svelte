<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, type Snippet } from 'svelte';

	type Props = { children?: Snippet };
	let { children }: Props = $props();

	onMount(() => {
		const lock = (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })
			.lock;
		if (typeof lock === 'function') {
			lock.call(screen.orientation, 'portrait').catch(() => {});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
