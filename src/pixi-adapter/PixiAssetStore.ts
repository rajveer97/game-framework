import * as PIXI from 'pixi.js';
import type { IAssetStore } from '../contracts/IAssetStore';

/**
 * PixiJS implementation of IAssetStore.
 *
 * Uses PIXI.Assets.load() under the hood.
 * The generic parameter is PIXI.Texture — other adapters (e.g., Three.js) would use their own type.
 */
export class PixiAssetStore implements IAssetStore<PIXI.Texture> {
  private textures = new Map<string, PIXI.Texture>();
  private audios = new Map<string, HTMLAudioElement>();

  async load(
    assets: Array<{ key: string; url: string; type: 'image' | 'audio' | 'atlas' }>,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const images = assets.filter(a => a.type === 'image' || a.type === 'atlas');
    const sounds = assets.filter(a => a.type === 'audio');

    let loaded = 0;
    const total = images.length + sounds.length;

    const tick = () => {
      loaded++;
      onProgress?.(total > 0 ? loaded / total : 1);
    };

    // Load images/atlases via PIXI.Assets
    await Promise.all(
      images.map(async asset => {
        const texture = await PIXI.Assets.load(asset.url) as PIXI.Texture;
        this.textures.set(asset.key, texture);
        tick();
      })
    );

    // Load audio elements
    sounds.forEach(asset => {
      const audio = new Audio(asset.url);
      audio.preload = 'auto';
      this.audios.set(asset.key, audio);
      tick();
    });
  }

  getTexture(key: string): PIXI.Texture {
    const t = this.textures.get(key);
    if (!t) throw new Error(`[PixiAssetStore] Texture not found: "${key}"`);
    return t;
  }

  getAudio(key: string): HTMLAudioElement {
    const a = this.audios.get(key);
    if (!a) throw new Error(`[PixiAssetStore] Audio not found: "${key}"`);
    return a;
  }

  hasTexture(key: string): boolean {
    return this.textures.has(key);
  }
}
