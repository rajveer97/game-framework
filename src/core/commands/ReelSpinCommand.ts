import type { Command } from './Command';
import type { GameContext } from './GameContext';
import type { ReelEngine } from '../../engine/ReelEngine';
import type { EventBus } from '../EventBus';
import { getSpinResult } from '../../mock/spinService';
import { GameConstant } from '../../constants/GameConstant';

export class ReelSpinCommand implements Command {
  constructor(
    private reelEngine: ReelEngine,
    private context: GameContext,
    private bus: EventBus
  ) {}

  async execute(): Promise<void> {
    const startTime = Date.now();

    // 1. Start the reels spinning
    this.reelEngine.startSpin();

    // 2. Fetch the result
    const result = await getSpinResult();
    this.context.spinResult = result;
    this.bus.emit('SPIN_RESULT', result);

    // 3. Ensure minimum spin duration has elapsed
    const elapsed = Date.now() - startTime;
    const remaining = GameConstant.MIN_SPIN_DURATION - elapsed;
    if (remaining > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, remaining));
    }

    // 4. Stop the reels sequentially and await complete stop
    await this.reelEngine.stopSpin(result);
  }
}
