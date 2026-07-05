import type { ICommand } from '../../framework/commands/ICommand';
import type { IHUDController } from '../../contracts/IHUDController';
import type { BalanceService } from '../services/BalanceService';
import type { SpinContext } from '../../framework/context/SpinContext';

/**
 * Optimistically deducts the bet amount from the client-side balance
 * at the start of each spin pipeline.
 *
 * The balance is later corrected with the authoritative server value
 * in UpdateBalanceCommand after the spin result arrives.
 *
 * Uses `canExecute()` as a guard to prevent spinning when the player
 * cannot afford the current bet.
 */
export class DeductBalanceCommand implements ICommand {
  readonly label = 'DeductBalance';

  constructor(
    private readonly balanceService: BalanceService,
    private readonly hud: IHUDController,
    private readonly context: SpinContext
  ) {}

  canExecute(): boolean {
    return this.balanceService.canAffordBet();
  }

  async execute(): Promise<void> {
    // Free spins don't cost the player
    if (this.context.isFreeSpinPhase) return;

    this.balanceService.deductBet();
    this.hud.setBalance(this.balanceService.getBalance());
    this.hud.setWin(0); // Reset win display at start of each spin
  }
}
