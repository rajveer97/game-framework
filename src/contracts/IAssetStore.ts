/**
 * Renderer-agnostic asset store.
 *
 * @template TTexture The native texture type (e.g., PIXI.Texture for PixiJS)
 */
export interface IAssetStore<TTexture = unknown> {
  /**
   * Load all provided assets. Should be called once during bootstrap.
   * @param assets List of assets with key, url, and type
   * @param onProgress Optional progress callback (0–1)
   */
  load(
    assets: Array<{ key: string; url: string; type: 'image' | 'audio' | 'atlas' }>,
    onProgress?: (progress: number) => void
  ): Promise<void>;

  /** Retrieve a preloaded texture by key. Throws if not found. */
  getTexture(key: string): TTexture;

  /** Retrieve a preloaded audio element by key. Throws if not found. */
  getAudio(key: string): HTMLAudioElement;

  /** Check if a texture has been loaded */
  hasTexture(key: string): boolean;
}
