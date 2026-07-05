export interface SpinResult {
  reels: number[][];           // final symbols for each reel
  winLines: WinLine[];         // winning lines
  currentWin: number;            // total payout
  balanceAfter: number;        // updated balance

  freeSpinsAwarded?: number;   // optional
  freeSpinsRemaining?: number; // optional
}

export interface WinLine {
  lineIndex: number;
  symbolIndex: number;
  count: number;
  payout: number;
}