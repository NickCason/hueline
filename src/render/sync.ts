import type { RenderContext } from './scene';
import type { GameState } from '../game/state';
import { makeTunnelLayer } from './layers/tunnel';
import { makeBarriersLayer } from './layers/barriers';
import { makePlayerLayer } from './layers/player';

export type SyncContext = ReturnType<typeof makeSyncContext>;

export function makeSyncContext(ctx: RenderContext) {
	const tunnel = makeTunnelLayer();
	const barriers = makeBarriersLayer();
	const player = makePlayerLayer();
	ctx.root.add(tunnel.object, barriers.object, player.object);

	return {
		sync(state: GameState, elapsed: number) {
			tunnel.tick(elapsed);
			barriers.sync(state.barriers, elapsed);
			player.sync(state.player, elapsed);
		}
	};
}
