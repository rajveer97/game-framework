import type { ICommand } from '../framework/commands/ICommand';
import type { SpinContext } from '../framework/context/SpinContext';
import type { CommandQueue } from '../framework/commands/CommandQueue';
import type { IReelController } from '../contracts/IReelController';
import type { IHUDController } from '../contracts/IHUDController';
import type { IWinPresenter } from '../contracts/IWinPresenter';
import type { ISpinService } from '../backend/ISpinService';
import type { IEventBus } from '../framework/events/IEventBus';
import type { GameConfig } from '../framework/config/GameConfig';
import type { SlotEvents } from './SlotEvents';
import type { FeatureRegistry } from './features/FeatureRegistry';
import type { BalanceService } from './services/BalanceService';

import { DeductBalanceCommand } from './commands/DeductBalanceCommand';
import { SetUIEnabledCommand } from './commands/SetUIEnabledCommand';
import { SpinReelsCommand } from './commands/SpinReelsCommand';
import { ShowWinsCommand } from './commands/ShowWinsCommand';
import { UpdateBalanceCommand } from './commands/UpdateBalanceCommand';
import { NotifyFeaturesCommand } from './commands/NotifyFeaturesCommand';

/**
 * SpinOrchestrator — the ONLY place where spin pipelines are assembled.
 *
 * All commands are constructed here and batched into the CommandQueue.
 * This removes the ad-hoc queue building that was scattered throughout the old Game.ts.
 *
 * Normal spin pipeline:
 * ```
 * [SetUIEnabled(false)]
 *   → [DeductBalance]
 *   → [SpinReels]          ← start + fetch + wait + stop
 *   → [ShowWins]           ← skipped if no wins (canExecute guard)
 *   → [UpdateBalance]
 *   → [NotifyFeatures]     ← plugins inject commands here (e.g., free spins)
 *   → [SetUIEnabled(true)]
 * ```
 *
 * Free spin cycles are injected before SetUIEnabled(true) by FreeSpinsPlugin.
 */
export class SpinOrchestrator {
  constructor(
    private readonly spinService: ISpinService,
    private readonly reelController: IReelController,
    private readonly hud: IHUDController,
    private readonly winPresenter: IWinPresenter,
    private readonly balanceService: BalanceService,
    private readonly featureRegistry: FeatureRegistry,
    private readonly queue: CommandQueue,
    private readonly bus: IEventBus<SlotEvents>,
    private readonly config: GameConfig
  ) {}

  /**
   * Build and enqueue a full normal spin pipeline.
   * @param ctx - A fresh SpinContext for this spin cycle
   */
  buildAndEnqueue(ctx: SpinContext): void {
    const commands = this.buildNormalPipeline(ctx);
    this.queue.batch(commands);

    this.bus.emit('SPIN_STARTED', ctx);
  }

  // ─── Pipeline Builders ────────────────────────────────────────────────────

  buildNormalPipeline(ctx: SpinContext): ICommand[] {
    return [
      new SetUIEnabledCommand(this.hud, false),
      new DeductBalanceCommand(this.balanceService, this.hud, ctx),
      new SpinReelsCommand(this.reelController, this.spinService, ctx, this.bus, this.config),
      new ShowWinsCommand(this.winPresenter, this.reelController, this.hud, ctx, this.bus),
      new UpdateBalanceCommand(this.balanceService, this.hud, ctx, this.bus),
      new NotifyFeaturesCommand(this.featureRegistry, this.queue, ctx),
      new SetUIEnabledCommand(this.hud, true, () => {
        this.bus.emit('SPIN_COMPLETE', ctx);
      }),
    ];
  }
}
