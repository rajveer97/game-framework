import * as PIXI from 'pixi.js';
import { Assets } from '../core/Assets';
import { AssetKeys } from '../constants/AssetKeys';

export class Background {
  public container = new PIXI.Container();
  private bgSprite!: PIXI.Sprite;

  constructor(private app: PIXI.Application) {
    this.create();
  }

  private create() {
    const texture = Assets.getTexture(AssetKeys.BACKGROUND);
    this.bgSprite = new PIXI.Sprite(texture);

    // start at top-left
    this.bgSprite.x = 0;
    this.bgSprite.y = 0;

    this.container.addChild(this.bgSprite);

    this.resize();
  }

  resize() {
  const screen = this.app.screen;
  const scaleX = screen.width / this.bgSprite.texture.width;
  const scaleY = screen.height / this.bgSprite.texture.height;
  const scale = Math.max(scaleX, scaleY);
  this.bgSprite.scale.set(scale);

  // center it
  this.bgSprite.x = (screen.width - this.bgSprite.width) / 2;
  this.bgSprite.y = (screen.height - this.bgSprite.height) / 2;
  }
}