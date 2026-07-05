import { PAYLINES } from '../constants/paylines';
import { GameConstant } from '../constants/GameConstant';
import type { WinLine } from '../types/SpinResult';

const PAYOUT_TABLE: Record<string, number[]> = {
  A: [0, 10, 20, 50, 100],
  K: [0, 8, 15, 40, 80],
  Q: [0, 5, 10, 30, 60],
  J: [0, 5, 10, 25, 50],
  WILD: [0, 15, 30, 80, 150],
  SCATTER: [0, 0, 0, 0, 0]
};

export class WinCalculator {
  static calculate(reels: number[][]): { winLines: WinLine[]; totalWin: number } {
    const winLines: WinLine[] = [];
    let totalWin = 0;

    PAYLINES.forEach((line, lineIndex) => {
      const symbols: string[] = [];

      for (let reelIndex = 0; reelIndex < reels.length; reelIndex++) {
        const rowIndex = line[reelIndex];
        const symbolIndex = reels[reelIndex][rowIndex];

        const symbol = GameConstant.SYMBOLS[symbolIndex % GameConstant.SYMBOLS.length];
        symbols.push(symbol);
      }

      const result = this.evaluateLine(symbols);

      if (result.count >= 3) {
        const payout = PAYOUT_TABLE[result.symbol][result.count] || 0;

        if (payout > 0) {
          winLines.push({
            lineIndex,
            symbolIndex: line[0],
            count: result.count,
            payout
          });

          totalWin += payout;
        }
      }
    });

    return { winLines, totalWin };
  }

  private static evaluateLine(symbols: string[]) {
    let baseSymbol = symbols[0];
    let count = 1;

    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === baseSymbol || symbols[i] === 'WILD') {
        count++;
      } else {
        break;
      }
    }

    return { symbol: baseSymbol, count };
  }

  static countScatters(reels: number[][]): number {
    let count = 0;

    reels.forEach(reel => {
      reel.forEach(symbolIndex => {
        const symbol = GameConstant.SYMBOLS[symbolIndex];

        if (symbol === 'SCATTER') {
          count++;
        }
      });
    });

    return count;
  }
}