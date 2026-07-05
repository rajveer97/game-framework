import type { Command } from './Command';
import type { GameContext } from './GameContext';
import type { FreeSpinsManager } from '../../features/freeSpins/FreeSpinsManager';
import type { HUD } from '../../ui/HUD';

export class FreeSpinsTransitionCommand implements Command {
  constructor(
    private freeSpinsManager: FreeSpinsManager,
    private hud: HUD,
    private context: GameContext
  ) {}

  async execute(): Promise<void> {
    const result = this.context.spinResult;
    if (!result) return;

    if (result.freeSpinsAwarded && result.freeSpinsAwarded > 0) {
      // Award free spins
      this.freeSpinsManager.awardFreeSpins(result.freeSpinsAwarded);
      this.hud.setFreeSpins(this.freeSpinsManager.getRemaining());

      console.log(`[FreeSpinsTransitionCommand] Free spins awarded: ${result.freeSpinsAwarded}. Total remaining: ${this.freeSpinsManager.getRemaining()}`);

      // Introduce a 2-second visual delay for the free spins trigger transition
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
    }
  }
}
