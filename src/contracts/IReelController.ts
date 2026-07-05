import type { ISpinResponse } from '../backend/ISpinResponse';

export interface SymbolPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Renderer-agnostic interface for controlling slot reels.
 *
 * Commands in `game/commands/` only know about this interface.
 * PixiJS, Three.js, or any other renderer can implement it.
 */
export interface IReelController {
  /** Start all reels spinning immediately */
  startSpin(): void;

  /**
   * Stagger-stop all reels using the provided result.
   * Resolves when ALL reels have fully stopped and settled.
   */
  stopSpin(result: ISpinResponse): Promise<void>;

  /**
   * Get the screen-space bounding box for a specific symbol cell.
   * Used by IWinPresenter to place win highlight overlays.
   */
  getSymbolPosition(reelIndex: number, rowIndex: number): SymbolPosition;

  getReelCount(): number;
  getRowCount(): number;

  /** Called every frame from the game loop with the renderer's delta time */
  update(delta: number): void;
}
