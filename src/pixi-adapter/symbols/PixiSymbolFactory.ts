import * as PIXI from 'pixi.js';
import type { PixiAssetStore } from '../PixiAssetStore';
import type { GameConfig } from '../../framework/config/GameConfig';

const SYMBOL_COLORS: Record<string, number> = {
  A: 0xe74c3c,
  K: 0x9b59b6,
  Q: 0x2ecc71,
  J: 0x3498db,
  WILD: 0xf39c12,
  SCATTER: 0x1abc9c,
};

/**
 * Creates and caches PIXI textures for slot symbols.
 *
 * Renders each symbol into a RenderTexture once on first request,
 * then returns the cached version for all subsequent calls.
 *
 * The symbol appearance: a coloured rounded rectangle background
 * with the symbol's loaded sprite rendered on top.
 * Falls back to a solid-colour label tile if the texture asset isn't loaded.
 */
export class PixiSymbolFactory {
  private static cache = new Map<string, PIXI.Texture>();

  static createTexture(
    symbolId: string,
    symbolKey: string,
    renderer: PIXI.IRenderer,
    assetStore: PixiAssetStore,
    config: GameConfig
  ): PIXI.Texture {
    const cacheKey = `${symbolId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const { symbolWidth, symbolHeight } = config.layout;
    const container = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(SYMBOL_COLORS[symbolId] ?? 0x2c3e50, 0.9);
    bg.drawRoundedRect(2, 2, symbolWidth - 4, symbolHeight - 4, 12);
    bg.endFill();

    // Inner glow border
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.drawRoundedRect(2, 2, symbolWidth - 4, symbolHeight - 4, 12);

    container.addChild(bg);

    // Symbol sprite (if asset is available)
    if (assetStore.hasTexture(symbolKey)) {
      const tex = assetStore.getTexture(symbolKey);
      const sprite = new PIXI.Sprite(tex);
      const padding = 12;
      const maxW = symbolWidth - padding * 2;
      const maxH = symbolHeight - padding * 2;
      const scale = Math.min(maxW / sprite.texture.width, maxH / sprite.texture.height);
      sprite.scale.set(scale);
      sprite.x = (symbolWidth - sprite.width) / 2;
      sprite.y = (symbolHeight - sprite.height) / 2;
      container.addChild(sprite);
    } else {
      // Fallback: text label
      const label = new PIXI.Text(symbolId, {
        fontFamily: 'Arial Black, Arial',
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.anchor.set(0.5);
      label.x = symbolWidth / 2;
      label.y = symbolHeight / 2;
      container.addChild(label);
    }

    const rt = PIXI.RenderTexture.create({ width: symbolWidth, height: symbolHeight });
    (renderer as PIXI.Renderer).render(container, { renderTexture: rt });

    this.cache.set(cacheKey, rt);
    return rt;
  }

  static createSprite(
    symbolId: string,
    symbolKey: string,
    renderer: PIXI.IRenderer,
    assetStore: PixiAssetStore,
    config: GameConfig
  ): PIXI.Sprite {
    const texture = this.createTexture(symbolId, symbolKey, renderer, assetStore, config);
    return new PIXI.Sprite(texture);
  }

  /** Clear the texture cache (call when changing themes or reloading assets) */
  static clearCache(): void {
    this.cache.forEach(t => t.destroy());
    this.cache.clear();
  }
}
