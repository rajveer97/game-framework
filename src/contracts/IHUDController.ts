/**
 * Renderer-agnostic HUD controller interface.
 *
 * All HUD mutations go through this interface. The PixiJS implementation
 * renders PIXI.Text and sprites; an HTML implementation could update DOM elements.
 */
export interface IHUDController {
  setBalance(amount: number): void;
  setBet(amount: number): void;
  setWin(amount: number): void;
  setFreeSpins(count: number): void;

  /**
   * Enable or disable player input (spin button).
   * When disabled, the button should be visually greyed out and non-interactive.
   */
  setEnabled(enabled: boolean): void;

  /** Called every frame from the game loop */
  update(delta: number): void;
}
