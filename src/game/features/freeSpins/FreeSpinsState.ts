/**
 * Self-contained free spins state — isolated from all external dependencies.
 * Owned by FreeSpinsPlugin and modified only through its API.
 */
export class FreeSpinsState {
  private _remaining: number = 0;
  private _isActive: boolean = false;
  private _totalAwarded: number = 0;
  private _totalWon: number = 0;

  // ─── Queries ─────────────────────────────────────────────────────────────

  getRemaining(): number {
    return this._remaining;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getTotalAwarded(): number {
    return this._totalAwarded;
  }

  getTotalWon(): number {
    return this._totalWon;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  award(count: number): void {
    this._remaining += count;
    this._totalAwarded += count;
    this._isActive = true;
  }

  consumeOne(): void {
    if (this._remaining <= 0) return;
    this._remaining--;
    if (this._remaining === 0) {
      this._isActive = false;
    }
  }

  addWin(amount: number): void {
    this._totalWon += amount;
  }

  reset(): void {
    this._remaining = 0;
    this._isActive = false;
    this._totalAwarded = 0;
    this._totalWon = 0;
  }
}
