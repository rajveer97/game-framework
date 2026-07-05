import { GameConstant } from '../constants/GameConstant';
import * as PIXI from 'pixi.js';
import { Assets } from '../core/Assets';
import { LayoutConstant } from '../constants/LayoutConstant';

export class SymbolFactory {
  private static textures: Map<string, PIXI.Texture> = new Map();

  static createTexture(label: string, renderer: PIXI.Renderer) {
    if (this.textures.has(label)) {
      return this.textures.get(label)!;
    }

    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c3e50);
    bg.drawRoundedRect(0, 0, 100, 100, 10);
    bg.endFill();

    // const text = new PIXI.Text(label, {fontSize: 20, fill: 0xffffff});
    // text.anchor.set(0.5);
    // text.x = 50;
    // text.y = 50;
    // container.addChild(bg, text);

    //-------------------
    const textureKey = Assets.getTexture(GameConstant.SymbolToTextureMap[label]);
    const sprite = new PIXI.Sprite(textureKey);
    const scale = LayoutConstant.SYMBOL_WIDTH / sprite.texture.width;
    sprite.scale.set(scale);
    // sprite.x = (LayoutConstant.SYMBOL_WIDTH - sprite.width) / 2;
    // sprite.y = index * LayoutConstant.SYMBOL_HEIGHT;
    // sprite.y =  LayoutConstant.SYMBOL_HEIGHT;
    container.addChild(bg, sprite);


    //-------------
    const rt = PIXI.RenderTexture.create({ width: 100, height: 100 });

    renderer.render(container, { renderTexture: rt });

    this.textures.set(label, rt);

    return rt;
  }

  static createSprite(label: string, renderer: PIXI.Renderer) {
    const texture = this.createTexture(label, renderer);
    return new PIXI.Sprite(texture);
  }
}