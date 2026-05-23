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

	let lastBarrierIds = new Set<number>();
	let lastPlayerHue = 0;

	return {
		sync(state: GameState, elapsed: number) {
			const currentIds = new Set(state.barriers.map((b) => b.id));
			for (const id of lastBarrierIds) {
				if (!currentIds.has(id)) {
					const laneWidth = 12 / state.tuning.laneCount;
					const x = -6 + laneWidth * (state.player.lane + 0.5);
					particles.emit(new THREE.Vector3(x, 0.6, 0), lastPlayerHue, elapsed);
				}
			}
			lastBarrierIds = currentIds;
			lastPlayerHue = state.player.hue;

			tunnel.tick(elapsed);
			barriers.sync(state.barriers, elapsed);
			player.sync(state.player, elapsed);
			particles.tick(elapsed);
		}
	};
}
