import * as PIXI from 'pixi.js';

export class WinLayer {
  public container = new PIXI.Container();

  private highlights: PIXI.Graphics[] = [];

  highlightSymbol(x: number, y: number) {
    const g = new PIXI.Graphics();

    g.lineStyle(4, 0xffff00);
    g.drawRect(x, y, 100, 100);

    this.container.addChild(g);
    this.highlights.push(g);
  }

  clear() {
    this.highlights.forEach(h => h.destroy());
    this.highlights = [];
  }
}