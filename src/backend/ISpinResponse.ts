/**
 * Canonical spin response — the single source of truth for spin outcome data.
 *
 * Both MockSpinService and HttpSpinService must produce this exact shape.
 * HttpSpinService uses ResponseMapper to translate server-specific JSON into this.
 */

export interface IWinLine {
  /** Index into the paylines array */
  lineIndex: number;

  /** The primary matching symbol ID (e.g., 'A', 'WILD') */
  symbolId: string;

  /** How many symbols matched left-to-right on this line */
  count: number;

  /** Payout for this specific winning line */
  payout: number;

  /**
   * Explicit grid coordinates of all matching symbols.
   * Used by IWinPresenter to place highlight overlays precisely.
   */
  positions: Array<{ reel: number; row: number }>;
}

export interface ISpinResponse {
  /**
   * Final symbol indices for each reel, indexed [reelIndex][rowIndex].
   * Values are indices into GameConfig.reels.symbols[].
   */
  reels: number[][];

  winLines: IWinLine[];

  /** Sum of all winning line payouts */
  totalWin: number;

  /** Player balance BEFORE this spin's bet was deducted */
  balanceBefore: number;

  /** Player balance AFTER this spin (including win) */
  balanceAfter: number;

  /** Number of free spins awarded by this spin (undefined = none) */
  freeSpinsAwarded?: number;

  /** Remaining free spins counter (set for free-spin results) */
  freeSpinsRemaining?: number;

  /** Whether a bonus game was triggered */
  bonusTriggered?: boolean;

  /**
   * Raw server metadata — preserved intact for extensibility.
   * Features can read from this for server-driven feature state.
   */
  metadata?: Record<string, unknown>;
}
