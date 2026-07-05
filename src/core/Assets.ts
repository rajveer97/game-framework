import * as PIXI from 'pixi.js';
import { AssetConfig } from './AssetConfig';

export class Assets {
  private static textures = new Map<string, PIXI.Texture>();
  private static sounds = new Map<string, HTMLAudioElement>();

  static async load(onProgress?: (p: number) => void) {
    // const total = AssetConfig.images.length + AssetConfig.atlases.length + AssetConfig.sounds.length;
    const total = AssetConfig.images.length;

    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      onProgress?.(loaded / total);
    };

    // Load Images
    await Promise.all(
      AssetConfig.images.map(async asset => {
        const texture = await PIXI.Assets.load(asset.url);
        this.textures.set(asset.key, texture);
        updateProgress();
      })
    );

    // Load Atlas (Spritesheet)
    // await Promise.all(
    //   AssetConfig.atlases.map(async atlas => {
    //     const sheet = await PIXI.Assets.load(atlas.url);

    //     Object.keys(sheet.textures).forEach(key => {
    //       this.textures.set(key, sheet.textures[key]);
    //     });

    //     updateProgress();
    //   })
    // );

    // Load Sounds
    // AssetConfig.sounds.forEach(sound => {
    //   const audio = new Audio(sound.url);
    //   this.sounds.set(sound.key, audio);
    //   updateProgress();
    // });
  }

  // Get Texture
  static getTexture(key: string): PIXI.Texture {
    const texture = this.textures.get(key);
    if (!texture) throw new Error(`Texture not found: ${key}`);
    return texture;
  }

  // Get Sound
  static getSound(key: string): HTMLAudioElement {
    const sound = this.sounds.get(key);
    if (!sound) throw new Error(`Sound not found: ${key}`);
    return sound;
  }

  // Play Sound Helper
  static playSound(key: string) {
    const sound = this.getSound(key);
    sound.currentTime = 0;
    sound.play();
  }
}