import type { PaytableConfig } from '../framework/config/GameConfig';
import type { IWinLine } from '../backend/ISpinResponse';

/**
 * Pure win calculation logic — no renderer or framework dependencies.
 *
 * Accepts GameConfig paytable and symbol list at construction time,
 * making it fully configurable and unit-testable in isolation.
 *
 * Note: In production, wins are calculated SERVER-SIDE and returned in ISpinResponse.
 * This class is used by MockSpinService for offline simulation and can also
 * be used client-side for instant feedback before the server response arrives.
 */
export class WinCalculator {
  private readonly wildId: string | undefined;
  private readonly scatterId: string | undefined;

  constructor(
    private readonly paytable: PaytableConfig,
    private readonly symbols: string[]
  ) {
    this.wildId = Object.entries(paytable.entries).find(([, v]) => v.isWild)?.[0];
    this.scatterId = Object.entries(paytable.entries).find(([, v]) => v.isScatter)?.[0];
  }

  // ─── Public ───────────────────────────────────────────────────────────────

  calculate(reels: number[][]): { winLines: IWinLine[]; totalWin: number } {
    const winLines: IWinLine[] = [];
    let totalWin = 0;

    this.paytable.paylines.forEach((line, lineIndex) => {
      const result = this.evaluateLine(reels, line, lineIndex);
      if (result) {
        winLines.push(result);
        totalWin += result.payout;
      }
    });

    return { winLines, totalWin };
  }

  countScatters(reels: number[][]): number {
    if (!this.scatterId) return 0;
    const scatterIdx = this.symbols.indexOf(this.scatterId);
    if (scatterIdx === -1) return 0;
    return reels.flat().filter(s => s === scatterIdx).length;
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private evaluateLine(
    reels: number[][],
    line: number[],
    lineIndex: number
  ): IWinLine | null {
    const lineSymbols = line.map((rowIdx, reelIdx) =>
      this.symbols[reels[reelIdx]?.[rowIdx] ?? 0]
    );

    // Find the base symbol (skip leading WILDs)
    let baseSymbol = lineSymbols[0];
    if (baseSymbol === this.wildId) {
      baseSymbol = lineSymbols.find(s => s !== this.wildId) ?? baseSymbol;
    }

    const entry = this.paytable.entries[baseSymbol];
    if (!entry || entry.isScatter) return null;

    let count = 0;
    const positions: Array<{ reel: number; row: number }> = [];

    for (let r = 0; r < lineSymbols.length; r++) {
      const matches =
        lineSymbols[r] === baseSymbol || lineSymbols[r] === this.wildId;
      if (!matches) break;
      count++;
      positions.push({ reel: r, row: line[r] });
    }

    if (count < 2) return null;

    const payout = entry.payouts[count - 1] ?? 0;
    if (payout <= 0) return null;

    return { lineIndex, symbolId: baseSymbol, count, payout, positions };
  }
}
