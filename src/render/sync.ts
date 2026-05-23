import * as THREE from 'three';
import type { RenderContext } from './scene';
import type { GameState } from '../game/state';
import { makeTunnelLayer } from './layers/tunnel';
import { makeBarriersLayer } from './layers/barriers';
import { makePlayerLayer } from './layers/player';
import { makeParticlesLayer } from './layers/particles';

export type SyncContext = ReturnType<typeof makeSyncContext>;

export function makeSyncContext(ctx: RenderContext) {
	const tunnel = makeTunnelLayer();
	const barriers = makeBarriersLayer();
	const player = makePlayerLayer();
	const particles = makeParticlesLayer();
	ctx.root.add(tunnel.object, barriers.object, player.object, particles.object);

	let lastElapsed = 0;
	let lastScore = 0;

	return {
		sync(state: GameState, elapsed: number) {
			const dt = lastElapsed === 0 ? 0.016 : elapsed - lastElapsed;
			lastElapsed = elapsed;

			if (state.run.score > lastScore) {
				particles.emit(new THREE.Vector3(0, 0.6, 0), state.player.hue, elapsed);
			}
			lastScore = state.run.score;

			tunnel.tick(elapsed);
			barriers.sync(state.barriers, elapsed);
			player.sync(state.player, elapsed, dt);
			particles.tick(elapsed);
		}
	};
}
