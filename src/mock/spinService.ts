import type { SpinResult } from '../types/SpinResult';
import { WinCalculator } from '../engine/WinCalculator';

export function getSpinResult(): Promise<SpinResult> {
  return new Promise(resolve => {
    setTimeout(() => {
      const reels = generateRandomReels();

      const { winLines, totalWin } = WinCalculator.calculate(reels);
      const scatterCount = WinCalculator.countScatters(reels);

      let freeSpinsAwarded = 0;

      if (scatterCount >= 3) {
        freeSpinsAwarded = 3; // configurable later
      }

      resolve({
        reels,
        winLines,
        currentWin: totalWin,
        balanceAfter: 1000,
        freeSpinsAwarded
      });
    }, 500);
  });
}

function generateRandomReels(): number[][] {
  const reels: number[][] = [];

  for (let i = 0; i < 5; i++) {
    reels.push([
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6)
    ]);
  }

  return reels;
}