import * as PIXI from 'pixi.js';

export class AssetLoader {
  static async load() {
    await PIXI.Assets.init({
      manifest: {
        bundles: [
          {
            name: 'game',
            assets: {
              // Add assets later
            }
          }
        ]
      }
    });

    await PIXI.Assets.loadBundle('game');
  }
}