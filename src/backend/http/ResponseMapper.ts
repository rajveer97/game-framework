import type { ISpinResponse, IWinLine } from '../ISpinResponse';

/**
 * Maps raw server JSON → canonical ISpinResponse.
 *
 * This is the ONLY place in the codebase that knows about server field names.
 * When the backend API changes (e.g., snake_case → camelCase, field renames),
 * update ONLY this file. Game logic remains untouched.
 *
 * Supports both camelCase and snake_case server responses.
 */
export class ResponseMapper {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static map(raw: Record<string, any>): ISpinResponse {
    return {
      reels: raw.reels ?? raw.reel_positions ?? [],
      winLines: (raw.win_lines ?? raw.winLines ?? []).map(ResponseMapper.mapWinLine),
      totalWin: raw.total_win ?? raw.totalWin ?? 0,
      balanceBefore: raw.balance_before ?? raw.balanceBefore ?? 0,
      balanceAfter: raw.balance_after ?? raw.balanceAfter ?? 0,
      freeSpinsAwarded: raw.free_spins_awarded ?? raw.freeSpinsAwarded,
      freeSpinsRemaining: raw.free_spins_remaining ?? raw.freeSpinsRemaining,
      bonusTriggered: raw.bonus_triggered ?? raw.bonusTriggered ?? false,
      metadata: raw.metadata,
    };
  }

  private static mapWinLine(raw: Record<string, any>): IWinLine {
    return {
      lineIndex: raw.line_index ?? raw.lineIndex ?? 0,
      symbolId: raw.symbol_id ?? raw.symbolId ?? '',
      count: raw.count ?? 0,
      payout: raw.payout ?? 0,
      positions: (raw.positions ?? []).map((p: any) => ({
        reel: p.reel ?? p.col ?? p.column ?? 0,
        row: p.row ?? 0,
      })),
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
