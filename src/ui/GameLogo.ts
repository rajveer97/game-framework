import { LayoutConstant } from '../constants/LayoutConstant';
import * as PIXI from 'pixi.js';

export class GameLogo {
  public container = new PIXI.Container();
  private logoText!: PIXI.Text;

  constructor(private app: PIXI.Application) {
    this.create();
  }

  private create() {
    this.logoText = new PIXI.Text(' Sugar Rush ', LayoutConstant.GAME_LOGO_STYLE);
    this.logoText.anchor.set(0.5);
    this.container.addChild(this.logoText);
    this.resize();
  }

  resize() {
    const { width } = this.app.screen;

    // 🎯 center horizontally
    this.logoText.x = width / 2;

    // 📍 top position
    this.logoText.y = 100;
  }
}