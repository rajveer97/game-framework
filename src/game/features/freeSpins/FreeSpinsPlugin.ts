import type { IFeaturePlugin } from '../../../contracts/IFeaturePlugin';
import type { ICommand } from '../../../framework/commands/ICommand';
import type { SpinContext } from '../../../framework/context/SpinContext';
import type { IHUDController } from '../../../contracts/IHUDController';
import type { IReelController } from '../../../contracts/IReelController';
import type { IWinPresenter } from '../../../contracts/IWinPresenter';
import type { ISpinService } from '../../../backend/ISpinService';
import type { IEventBus } from '../../../framework/events/IEventBus';
import type { CommandQueue } from '../../../framework/commands/CommandQueue';
import type { GameConfig } from '../../../framework/config/GameConfig';
import type { SlotEvents } from '../../SlotEvents';
import { FreeSpinsState } from './FreeSpinsState';
import { FreeSpinsTransitionCommand } from './FreeSpinsTransitionCommand';
import { SpinReelsCommand } from '../../commands/SpinReelsCommand';
import { ShowWinsCommand } from '../../commands/ShowWinsCommand';
import { UpdateBalanceCommand } from '../../commands/UpdateBalanceCommand';
import { NotifyFeaturesCommand } from '../../commands/NotifyFeaturesCommand';
import type { BalanceService } from '../../services/BalanceService';
import type { FeatureRegistry } from '../FeatureRegistry';

/**
 * Free Spins Feature Plugin
 *
 * Implements the IFeaturePlugin interface — registered with FeatureRegistry at bootstrap.
 * The plugin handles TWO scenarios:
 *
 * 1. **Trigger** (spin result has freeSpinsAwarded > 0):
 *    Injects: FreeSpinsTransitionCommand → [free spin cycle commands]
 *
 * 2. **Active cycle** (free spins are running, remaining > 0):
 *    Injects: SpinReels → ShowWins → UpdateBalance → NotifyFeatures (recursive)
 *    The recursive NotifyFeatures call allows re-triggers within free spins.
 *
 * When free spins are exhausted: returns empty array → pipeline continues to EnableUI.
 *
 * This plugin replaces the old FreeSpinsCycleCommand self-referential approach
 * with a cleaner plugin-based model.
 */
export class FreeSpinsPlugin implements IFeaturePlugin {
  readonly id = 'freeSpins';
  readonly name = 'Free Spins';

  private readonly state = new FreeSpinsState();

  constructor(
    private readonly hud: IHUDController,
    private readonly reelController: IReelController,
    private readonly winPresenter: IWinPresenter,
    private readonly spinService: ISpinService,
    private readonly balanceService: BalanceService,
    private readonly featureRegistry: FeatureRegistry,
    private readonly queue: CommandQueue,
    private readonly bus: IEventBus<SlotEvents>,
    private readonly config: GameConfig
  ) {}

  // ─── IFeaturePlugin ───────────────────────────────────────────────────────

  onSpinResult(ctx: SpinContext): ICommand[] {
    const result = ctx.spinResponse;
    if (!result) return [];

    // Case 1: Free spins just triggered by this spin result
    if (result.freeSpinsAwarded && result.freeSpinsAwarded > 0 && !this.state.isActive()) {
      return this.buildTriggerCommands(ctx);
    }

    // Case 2: We're mid free spin cycle — advance one spin
    if (this.state.isActive() && this.state.getRemaining() > 0) {
      return this.buildFreeSpinCycleCommands();
    }

    // Case 3: Free spins just finished
    if (!this.state.isActive() && ctx.isFreeSpinPhase) {
      this.onDeactivate?.();
    }

    return [];
  }

  isActive(): boolean {
    return this.state.isActive();
  }

  onActivate(): void {
    console.log('[FreeSpins] Feature activated');
    this.bus.emit('FREE_SPINS_TRIGGERED', { count: this.state.getRemaining() });
  }

  onDeactivate(): void {
    console.log('[FreeSpins] Feature complete. Total won:', this.state.getTotalWon());
    this.bus.emit('FREE_SPINS_COMPLETE', undefined);
    this.hud.setFreeSpins(0);
  }

  reset(): void {
    this.state.reset();
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private buildTriggerCommands(ctx: SpinContext): ICommand[] {
    return [
      new FreeSpinsTransitionCommand(this.state, this.hud, this.bus, ctx),
      ...this.buildFreeSpinCycleCommands(),
    ];
  }

  private buildFreeSpinCycleCommands(): ICommand[] {
    this.state.consumeOne();
    this.hud.setFreeSpins(this.state.getRemaining());

    this.bus.emit('FREE_SPINS_UPDATED', { remaining: this.state.getRemaining() });

    const fsCtx = new SpinContext(this.config, { isFreeSpinPhase: true });
    fsCtx.freeSpinsRemaining = this.state.getRemaining();

    return [
      new SpinReelsCommand(
        this.reelController,
        this.spinService,
        fsCtx,
        this.bus,
        this.config
      ),
      new ShowWinsCommand(
        this.winPresenter,
        this.reelController,
        this.hud,
        fsCtx,
        this.bus
      ),
      new UpdateBalanceCommand(this.balanceService, this.hud, fsCtx, this.bus),
      // Recursive notify — lets this plugin inject ANOTHER cycle if spins remain
      new NotifyFeaturesCommand(this.featureRegistry, this.queue, fsCtx),
    ];
  }
}
