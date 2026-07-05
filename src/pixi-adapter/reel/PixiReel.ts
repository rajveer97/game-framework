import * as PIXI from 'pixi.js';
import type { GameConfig } from '../../framework/config/GameConfig';
import type { PixiAssetStore } from '../PixiAssetStore';
import { PixiSymbolFactory } from '../symbols/PixiSymbolFactory';

/**
 * A single reel strip — manages one column of symbols.
 *
 * Responsibilities:
 * - Owns and positions its column of PIXI.Sprites
 * - Runs the scroll/spin animation via update()
 * - Handles deceleration and snap-to-grid on stop
 * - Applies the server-provided final symbols when stopped
 */
export class PixiReel {
  public readonly container = new PIXI.Container();

  private sprites: PIXI.Sprite[] = [];
  private symbolIds: string[] = [];

  private speed = 0;
  private isStopping = false;
  private targetSymbolIndices: number[] = [];
  private stopCallback?: () => void;

  private readonly symbols: string[];
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly rowCount: number;
  private readonly spinSpeed: number;
  private readonly deceleration: number;
  private readonly stopThreshold = 1;

  constructor(
    private readonly reelIndex: number,
    private readonly renderer: PIXI.IRenderer,
    private readonly assetStore: PixiAssetStore,
    private readonly config: GameConfig
  ) {
    this.symbols = config.reels.symbols;
    this.symbolWidth = config.layout.symbolWidth;
    this.symbolHeight = config.layout.symbolHeight;
    this.rowCount = config.reels.rowCount;
    this.spinSpeed = config.reels.spinSpeed;
    this.deceleration = config.reels.deceleration;

    this.createSymbols();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  startSpin(): void {
    this.speed = this.spinSpeed;
    this.isStopping = false;
  }

  /**
   * Begin the stopping sequence with specific target symbols.
   * @param resultIndices - Symbol indices (from ISpinResponse.reels[reelIndex])
   * @returns Resolves when the reel has fully stopped and snapped to grid
   */
  stopSpin(resultIndices: number[]): Promise<void> {
    this.targetSymbolIndices = resultIndices;
    this.isStopping = true;

    return new Promise<void>(resolve => {
      this.stopCallback = resolve;
    });
  }

  update(delta: number): void {
    // Scroll all symbols down
    this.sprites.forEach(s => {
      s.y += this.speed * delta;
    });

    this.recycleSymbols();

    if (this.isStopping) {
      this.applyDeceleration(delta);
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private createSymbols(): void {
    // One extra symbol above the visible area for seamless looping
    for (let i = 0; i < this.rowCount + 1; i++) {
      const symbolId = this.symbols[i % this.symbols.length];
      const symbolKey = this.getSymbolKey(symbolId);
      const sprite = PixiSymbolFactory.createSprite(
        symbolId, symbolKey, this.renderer, this.assetStore, this.config
      );
      sprite.y = i * this.symbolHeight;
      this.symbolIds.push(symbolId);
      this.sprites.push(sprite);
      this.container.addChild(sprite);
    }
  }

  private recycleSymbols(): void {
    const stripHeight = this.symbolHeight * this.sprites.length;
    const bottomEdge = this.symbolHeight * this.rowCount;

    for (let i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].y >= bottomEdge) {
        // Wrap sprite to the top
        this.sprites[i].y -= stripHeight;

        // Assign a random symbol while scrolling
        const randomId = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        this.updateSprite(i, randomId);
      }
    }
  }

  private applyDeceleration(delta: number): void {
    this.speed -= this.deceleration * delta;

    if (this.speed <= this.stopThreshold) {
      this.forceStop();
    }
  }

  private forceStop(): void {
    this.speed = 0;
    this.isStopping = false;

    // Snap sprites to grid
    for (let i = 0; i < this.sprites.length; i++) {
      this.sprites[i].y = i * this.symbolHeight;
    }

    // Apply final symbols from the server result
    this.applyFinalSymbols();

    const cb = this.stopCallback;
    this.stopCallback = undefined;
    cb?.();
  }

  private applyFinalSymbols(): void {
    for (let row = 0; row < this.rowCount; row++) {
      const targetId = this.symbols[
        (this.targetSymbolIndices[row] ?? 0) % this.symbols.length
      ];
      this.updateSprite(row, targetId);
      this.sprites[row].y = row * this.symbolHeight;
    }
  }

  private updateSprite(index: number, symbolId: string): void {
    const symbolKey = this.getSymbolKey(symbolId);
    const newTexture = PixiSymbolFactory.createTexture(
      symbolId, symbolKey, this.renderer, this.assetStore, this.config
    );
    this.sprites[index].texture = newTexture;
    this.symbolIds[index] = symbolId;
  }

  private getSymbolKey(symbolId: string): string {
    return `symbol_${symbolId}`;
  }
}
