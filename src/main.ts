import * as PIXI from 'pixi.js';
import { Assets } from './core/Assets';
import { Game } from './core/Game';
import { GameConstant } from './constants/GameConstant';

(async () => {
  const app = new PIXI.Application({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    width: GameConstant.WIDTH,
    height: GameConstant.HEIGHT
  });

  document.body.appendChild(app.view as HTMLCanvasElement);
  (app.view as HTMLCanvasElement).style.display = 'block';

  await Assets.load(progress => {
    console.log(`Loading: ${Math.round(progress * 100)}%`);
  });



  const game = new Game(app);
  game.init();
})();