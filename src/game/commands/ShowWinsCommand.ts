import type { ICommand } from '../../framework/commands/ICommand';
import type { IWinPresenter } from '../../contracts/IWinPresenter';
import type { IReelController } from '../../contracts/IReelController';
import type { IHUDController } from '../../contracts/IHUDController';
import type { SpinContext } from '../../framework/context/SpinContext';
import type { IEventBus } from '../../framework/events/IEventBus';
import type { SlotEvents } from '../SlotEvents';

/**
 * Presents winning lines to the player.
 *
 * - Delegates all visual work to IWinPresenter (renderer-agnostic)
 * - Updates the HUD win display with the total win amount
 * - Skips silently if there are no wins
 * - Emits WIN_PRESENTATION_DONE when complete
 */
export class ShowWinsCommand implements ICommand {
  readonly label = 'ShowWins';

  constructor(
    private readonly winPresenter: IWinPresenter,
    private readonly reelController: IReelController,
    private readonly hud: IHUDController,
    private readonly context: SpinContext,
    private readonly bus: IEventBus<SlotEvents>
  ) {}

  canExecute(): boolean {
    // Skip if no result or no wins
    const result = this.context.spinResponse;
    return result !== null && result.winLines.length > 0 && result.totalWin > 0;
  }

  async execute(): Promise<void> {
    const result = this.context.spinResponse!;

    // Update win display
    this.hud.setWin(result.totalWin);

    // Delegate visual presentation
    await this.winPresenter.showWins(result.winLines, this.reelController);

    this.bus.emit('WIN_PRESENTATION_DONE', undefined);
  }
}
