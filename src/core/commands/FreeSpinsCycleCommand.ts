import type { Command } from './Command';
import type { CommandQueue } from './CommandQueue';
import type { GameContext } from './GameContext';
import type { FreeSpinsManager } from '../../features/freeSpins/FreeSpinsManager';
import type { HUD } from '../../ui/HUD';
import type { ReelEngine } from '../../engine/ReelEngine';
import type { WinLayer } from '../../ui/WinLayer';
import type { EventBus } from '../EventBus';
import { ReelSpinCommand } from './ReelSpinCommand';
import { ShowWinsCommand } from './ShowWinsCommand';
import { FreeSpinsTransitionCommand } from './FreeSpinsTransitionCommand';

export class FreeSpinsCycleCommand implements Command {
  constructor(
    private freeSpinsManager: FreeSpinsManager,
    private hud: HUD,
    private reelEngine: ReelEngine,
    private winLayer: WinLayer,
    private queue: CommandQueue,
    private bus: EventBus
  ) {}

  async execute(): Promise<void> {
    if (this.freeSpinsManager.isFreeSpinActive() && this.freeSpinsManager.getRemaining() > 0) {
      // 1. Decrement free spin remaining count
      this.freeSpinsManager.decrement();

      // 2. Update free spins counter on HUD
      this.hud.setFreeSpins(this.freeSpinsManager.getRemaining());

      console.log(`[FreeSpinsCycleCommand] Starting Free Spin. Remaining: ${this.freeSpinsManager.getRemaining()}`);

      // 3. Create a fresh context for the free spin round
      const fsContext: GameContext = {};

      // 4. Prepend the next cycle in reverse order so they execute in the correct order:
      //    ReelSpinCommand -> ShowWinsCommand -> FreeSpinsTransitionCommand -> FreeSpinsCycleCommand
      this.queue.addFirst(this.fsCycleSelf());
      this.queue.addFirst(new FreeSpinsTransitionCommand(this.freeSpinsManager, this.hud, fsContext));
      this.queue.addFirst(new ShowWinsCommand(this.winLayer, this.reelEngine, fsContext));
      this.queue.addFirst(new ReelSpinCommand(this.reelEngine, fsContext, this.bus));

      // Add a tiny delay between cycles for visual clarity
      await new Promise<void>(resolve => setTimeout(resolve, 200));
    } else {
      console.log('[FreeSpinsCycleCommand] Free spins completed or inactive.');
    }
  }

  private fsCycleSelf(): FreeSpinsCycleCommand {
    return new FreeSpinsCycleCommand(
      this.freeSpinsManager,
      this.hud,
      this.reelEngine,
      this.winLayer,
      this.queue,
      this.bus
    );
  }
}
