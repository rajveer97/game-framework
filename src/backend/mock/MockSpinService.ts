import type { ISpinService } from '../ISpinService';
import type { ISpinRequest } from '../ISpinRequest';
import type { ISpinResponse, IWinLine } from '../ISpinResponse';
import type { GameConfig, PaytableConfig } from '../../framework/config/GameConfig';

/**
 * In-memory mock spin service for local development and QA.
 *
 * Features:
 * - Uses the paytable defined in GameConfig for authentic win calculations
 * - Supports WILD symbol substitution
 * - Detects scatter symbols for free spin trigger
 * - Configurable network delay simulation
 * - `setForcedResult()` for deterministic QA testing
 *
 * No PixiJS or renderer dependencies — pure TypeScript logic.
 */
export class MockSpinService implements ISpinService {
  private forcedResult: ISpinResponse | null = null;
  private readonly delay: number;

  constructor(private readonly config: GameConfig) {
    this.delay = config.backend.mockDelay ?? 500;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Force a specific result on the NEXT spin (cleared after use) */
  setForcedResult(result: ISpinResponse): void {
    this.forcedResult = result;
  }

  clearForcedResult(): void {
    this.forcedResult = null;
  }

  async spin(request: ISpinRequest): Promise<ISpinResponse> {
    await this.simulateDelay();

    if (this.forcedResult) {
      const result = { ...this.forcedResult };
      this.forcedResult = null;
      return result;
    }

    return this.generateResult(request);
  }

  // ─── Result Generation ─────────────────────────────────────────────────────

  private generateResult(request: ISpinRequest): ISpinResponse {
    const { reels: reelCfg, paytable, bet } = this.config;

    const reels = this.generateReels(
      reelCfg.reelCount,
      reelCfg.rowCount,
      reelCfg.symbols.length
    );

    const { winLines, totalWin } = this.calculateWins(reels, paytable, reelCfg.symbols);
    const freeSpinsAwarded = this.checkScatterTrigger(reels, paytable, reelCfg.symbols);

    // In a real implementation, balanceBefore/After come from the server.
    // The mock uses startingBalance as a base. The actual balance tracking
    // lives in BalanceService on the client.
    const balanceBefore = bet.startingBalance;
    const balanceAfter = balanceBefore - request.betAmount + totalWin;

    return {
      reels,
      winLines,
      totalWin,
      balanceBefore,
      balanceAfter,
      freeSpinsAwarded: freeSpinsAwarded > 0 ? freeSpinsAwarded : undefined,
    };
  }

  private generateReels(
    reelCount: number,
    rowCount: number,
    symbolCount: number
  ): number[][] {
    return Array.from({ length: reelCount }, () =>
      Array.from({ length: rowCount }, () => Math.floor(Math.random() * symbolCount))
    );
  }

  // ─── Win Calculation ───────────────────────────────────────────────────────

  private calculateWins(
    reels: number[][],
    paytable: PaytableConfig,
    symbolIds: string[]
  ): { winLines: IWinLine[]; totalWin: number } {
    const winLines: IWinLine[] = [];
    let totalWin = 0;

    // Identify wild symbol (if any)
    const wildId = Object.entries(paytable.entries).find(([, v]) => v.isWild)?.[0];

    paytable.paylines.forEach((line, lineIndex) => {
      const lineSymbols = line.map((rowIdx, reelIdx) =>
        symbolIds[reels[reelIdx][rowIdx]]
      );

      // Determine the base symbol (skip wilds at the start)
      let baseSymbol = lineSymbols[0];
      if (baseSymbol === wildId) {
        baseSymbol = lineSymbols.find(s => s !== wildId) ?? baseSymbol;
      }
      if (!baseSymbol || !paytable.entries[baseSymbol]) return;

      // Count consecutive matching symbols from left
      let count = 0;
      const positions: Array<{ reel: number; row: number }> = [];

      for (let r = 0; r < lineSymbols.length; r++) {
        const isMatch = lineSymbols[r] === baseSymbol || lineSymbols[r] === wildId;
        if (!isMatch) break;
        count++;
        positions.push({ reel: r, row: line[r] });
      }

      if (count < 2) return;

      const entry = paytable.entries[baseSymbol];
      const payout = entry?.payouts[count - 1] ?? 0;
      if (payout <= 0) return;

      winLines.push({ lineIndex, symbolId: baseSymbol, count, payout, positions });
      totalWin += payout;
    });

    return { winLines, totalWin };
  }

  private checkScatterTrigger(
    reels: number[][],
    paytable: PaytableConfig,
    symbolIds: string[]
  ): number {
    const scatterEntry = Object.entries(paytable.entries).find(([, v]) => v.isScatter);
    if (!scatterEntry) return 0;

    const scatterId = scatterEntry[0];
    const scatterIdx = symbolIds.indexOf(scatterId);
    if (scatterIdx === -1) return 0;

    const scatterCount = reels.flat().filter(s => s === scatterIdx).length;
    const triggerAt = paytable.scatterTriggerCount ?? 3;

    return scatterCount >= triggerAt ? (paytable.freeSpinsAwardCount ?? 10) : 0;
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}
