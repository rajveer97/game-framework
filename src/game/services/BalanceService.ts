/**
 * Client-side balance and bet state manager.
 *
 * Tracks the player's balance locally between spins.
 * The authoritative balance always comes from the backend (ISpinResponse.balanceAfter)
 * and is synced via `updateFromResponse()` after each spin result.
 *
 * An optimistic deduction is applied by DeductBalanceCommand before the spin,
 * then corrected when the real balance arrives.
 */
export class BalanceService {
  private _balance: number;
  private _bet: number;

  constructor(startingBalance: number, defaultBet: number) {
    this._balance = startingBalance;
    this._bet = defaultBet;
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  getBalance(): number {
    return this._balance;
  }

  getBet(): number {
    return this._bet;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  /** Optimistically deduct the current bet from balance */
  deductBet(): void {
    this._balance -= this._bet;
  }

  /**
   * Sync balance with the authoritative value from the backend response.
   * Called in UpdateBalanceCommand after the spin result arrives.
   */
  updateFromResponse(balanceAfter: number): void {
    this._balance = balanceAfter;
  }

  /**
   * Change the current bet level.
   * Should only be called when the game is in IDLE state.
   */
  setBet(amount: number): void {
    this._bet = amount;
  }

  /**
   * Whether the player can afford the current bet.
   * Used as a canExecute() guard on DeductBalanceCommand.
   */
  canAffordBet(): boolean {
    return this._balance >= this._bet;
  }
}
