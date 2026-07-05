import * as PIXI from 'pixi.js';
import { EventBus } from './EventBus';
import { StateMachine } from './StateMachine';
import { ReelEngine } from '../engine/ReelEngine';
import { HUD } from '../ui/HUD';
import { WinLayer } from '../ui/WinLayer';
import { FreeSpinsManager } from '../features/freeSpins/FreeSpinsManager';
import { Background } from '../ui/Background';
import { GameLogo } from '../ui/GameLogo';

// Commands
import { CommandQueue } from './commands/CommandQueue';
import type { GameContext } from './commands/GameContext';
import { DeductBalanceCommand } from './commands/DeductBalanceCommand';
import { ReelSpinCommand } from './commands/ReelSpinCommand';
import { ShowWinsCommand } from './commands/ShowWinsCommand';
import { FreeSpinsTransitionCommand } from './commands/FreeSpinsTransitionCommand';
import { FreeSpinsCycleCommand } from './commands/FreeSpinsCycleCommand';
import { EnableUICommand } from './commands/EnableUICommand';

export class Game {
  private background!: Background;
  private gameLogo!: GameLogo;
  private bus = new EventBus();
  private stateMachine = new StateMachine(this.bus);
  private commandQueue = new CommandQueue();

  private reelEngine!: ReelEngine;
  private hud!: HUD;
  private winLayer!: WinLayer;
  private freeSpinsManager!: FreeSpinsManager;

  private isSpinning = false;

  constructor(private app: PIXI.Application) { }

  async init() {
    this.createScene();
    this.registerEvents();

    this.freeSpinsManager = new FreeSpinsManager();

    this.app.ticker.add(this.update);
  }

  public getStateMachine(): StateMachine {
    return this.stateMachine;
  }

  private createScene() {
    const gameContainer = new PIXI.Container();
    this.app.stage.addChild(gameContainer);

    // Background
    this.background = new Background(this.app);
    gameContainer.addChild(this.background.container);

    // Game Logo
    this.gameLogo = new GameLogo(this.app);
    gameContainer.addChild(this.gameLogo.container);

    // Reel Engine
    this.reelEngine = new ReelEngine(this.app);
    gameContainer.addChild(this.reelEngine.container);

    // Win Layer
    this.winLayer = new WinLayer();
    gameContainer.addChild(this.winLayer.container);

    // HUD
    this.hud = new HUD(this.bus);
    gameContainer.addChild(this.hud.container);
  }

  private registerEvents() {
    window.addEventListener('resize', this.onResize);

    // SPIN REQUEST
    this.bus.on('SPIN_REQUESTED', () => {
      this.handleSpinRequest();
    });
  }

  // =========================
  // SPIN FLOW (Command-Queue Driven)
  // =========================

  private handleSpinRequest = () => {
    if (this.isSpinning) return; // prevent double spin
    this.isSpinning = true;

    this.hud.setSpinEnabled(false);

    // Context shared across this spin sequence execution
    const context: GameContext = {};

    // Build and enqueue the sequential command pipeline
    this.commandQueue.add(new DeductBalanceCommand(this.hud));
    this.commandQueue.add(new ReelSpinCommand(this.reelEngine, context, this.bus));
    this.commandQueue.add(new ShowWinsCommand(this.winLayer, this.reelEngine, context));
    this.commandQueue.add(new FreeSpinsTransitionCommand(this.freeSpinsManager, this.hud, context));
    this.commandQueue.add(new FreeSpinsCycleCommand(
      this.freeSpinsManager,
      this.hud,
      this.reelEngine,
      this.winLayer,
      this.commandQueue,
      this.bus
    ));
    this.commandQueue.add(new EnableUICommand(this.hud, () => {
      this.isSpinning = false;
      this.bus.emit('WIN_PRESENTATION_DONE');
    }));
  };

  // =========================
  // UPDATE LOOP
  // =========================

  private update = (delta: number) => {
    this.reelEngine.update(delta);
    this.hud.update(delta);
  };

  private onResize = () => {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.background.resize();
    this.gameLogo.resize();
  };
}