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

	let lastScore = 0;

	return {
		sync(state: GameState, elapsed: number) {
			// Only emit a burst when score actually went up (a real break) — not for
			// lane-mismatch barriers that silently passed through.
			if (state.run.score > lastScore) {
				const laneWidth = 12 / state.tuning.laneCount;
				const x = -6 + laneWidth * (state.player.lane + 0.5);
				particles.emit(new THREE.Vector3(x, 0.6, 0), state.player.hue, elapsed);
			}
			lastScore = state.run.score;

			tunnel.tick(elapsed);
			barriers.sync(state.barriers, elapsed);
			player.sync(state.player, elapsed);
			particles.tick(elapsed);
		}
	};
}
