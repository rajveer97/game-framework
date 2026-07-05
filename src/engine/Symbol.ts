import * as PIXI from 'pixi.js';

export class Symbol {
  public sprite: PIXI.Sprite;
  public symbolId: string;

  constructor(sprite: PIXI.Sprite, symbolId: string) {
    this.sprite = sprite;
    this.symbolId = symbolId;
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setSymbol(texture: PIXI.Texture, id: string) {
    this.sprite.texture = texture;
    this.symbolId = id;
  }
}