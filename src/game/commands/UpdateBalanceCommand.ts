import type { ICommand } from '../../framework/commands/ICommand';
import type { IHUDController } from '../../contracts/IHUDController';
import type { BalanceService } from '../services/BalanceService';
import type { SpinContext } from '../../framework/context/SpinContext';
import type { IEventBus } from '../../framework/events/IEventBus';
import type { SlotEvents } from '../SlotEvents';

/**
 * Syncs the client balance with the authoritative backend value.
 *
 * Called after every spin (normal and free spin) to correct any
 * optimistic deduction discrepancy and reflect the true server balance.
 */
export class UpdateBalanceCommand implements ICommand {
  readonly label = 'UpdateBalance';

  constructor(
    private readonly balanceService: BalanceService,
    private readonly hud: IHUDController,
    private readonly context: SpinContext,
    private readonly bus: IEventBus<SlotEvents>
  ) {}

  async execute(): Promise<void> {
    const result = this.context.spinResponse;
    if (!result) return;

    this.balanceService.updateFromResponse(result.balanceAfter);
    this.hud.setBalance(result.balanceAfter);

    this.bus.emit('BALANCE_UPDATED', { amount: result.balanceAfter });
  }
}
