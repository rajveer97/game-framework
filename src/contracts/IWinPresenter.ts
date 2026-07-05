import type { IWinLine } from '../backend/ISpinResponse';
import type { IReelController } from './IReelController';

/**
 * Renderer-agnostic win presentation interface.
 *
 * Responsible for displaying win highlights (payline overlays, glow effects, etc.)
 * and resolving when the full win presentation animation is complete.
 */
export interface IWinPresenter {
  /**
   * Play the win presentation for the given win lines.
   * Uses `reelController.getSymbolPosition()` to place highlights.
   * @returns Resolves when all win animations have completed
   */
  showWins(lines: IWinLine[], reelController: IReelController): Promise<void>;

  /** Remove all win highlight overlays from the screen */
  clear(): void;
}
