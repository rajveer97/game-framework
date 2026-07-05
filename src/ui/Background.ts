import * as PIXI from 'pixi.js';
import { Assets } from '../core/Assets';
import { AssetKeys } from '../constants/AssetKeys';

export class Background {
  public container = new PIXI.Container();
  private bgSprite!: PIXI.Sprite;

  constructor(private app: PIXI.Application) {
    this.create();
    this.resizeBackground();
  }

  private create() {
    const texture = Assets.getTexture(AssetKeys.BACKGROUND);
    this.bgSprite = new PIXI.Sprite(texture);
    this.bgSprite.anchor.set(0.5);
    this.container.addChild(this.bgSprite);
  }

  public resizeBackground(): void {
    const { width, height } = this.app.screen;
    this.bgSprite.position.set(width * 0.5,height * 0.5);
    const scale = Math.max(width / this.bgSprite.texture.width,height / this.bgSprite.texture.height);
    this.bgSprite.scale.set(scale);
  }
}