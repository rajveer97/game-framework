import * as PIXI from 'pixi.js';
import { Symbol } from './Symbol';
import { SymbolFactory } from '../rendering/SymbolFactory';
import { LayoutConstant } from '../constants/LayoutConstant';
import { GameConstant } from '../constants/GameConstant';

export class Reel {
    public container = new PIXI.Container();
    private symbols: Symbol[] = [];
    private speed = 0;
    private isStopping = false;
    private targetSymbols: string[] = [];
    private stopThreshold = 1;        // speed threshold

    private onStopCallback?: () => void;

    constructor(_index: number, private renderer: PIXI.Renderer) {
        this.createSymbols();
    }

    private createSymbols() {
        for (let i = 0; i < GameConstant.ROWS + 1; i++) {
            const label = GameConstant.SYMBOLS[i % GameConstant.SYMBOLS.length];

            const sprite = SymbolFactory.createSprite(label, this.renderer);
            const symbol = new Symbol(sprite, label);

            symbol.setPosition(0, i * LayoutConstant.SYMBOL_HEIGHT);

            this.symbols.push(symbol);
            this.container.addChild(sprite);
        }
    }

    startSpin() {
        this.speed = GameConstant.SPIN_SPEED;
        this.isStopping = false;
    }

    stopSpin(resultSymbols: number[]): Promise<void> {
        this.targetSymbols = resultSymbols.map(
            i => GameConstant.SYMBOLS[i % GameConstant.SYMBOLS.length]
        );

        this.isStopping = true;

        return new Promise<void>((resolve) => {
            this.onStopCallback = resolve;
        });
    }

    update(delta: number) {
        this.symbols.forEach(symbol => {
            symbol.sprite.y += this.speed * delta;
        });

        this.recycleSymbols();

        if (this.isStopping) {
            this.applyDeceleration(delta);
        }
    }

    private applyDeceleration(delta: number) {
        this.speed -= GameConstant.DECELERATION * delta;

        if (this.speed <= this.stopThreshold) {
            this.forceStop();
        }
    }

    private recycleSymbols() {
        for (let symbol of this.symbols) {
            if (symbol.sprite.y > LayoutConstant.SYMBOL_HEIGHT * GameConstant.ROWS) {
                symbol.sprite.y -= LayoutConstant.SYMBOL_HEIGHT * this.symbols.length;

                const randomSymbol =
                    GameConstant.SYMBOLS[
                    Math.floor(Math.random() * GameConstant.SYMBOLS.length)
                    ];

                const texture = SymbolFactory.createTexture(
                    randomSymbol,
                    this.renderer
                );

                symbol.setSymbol(texture, randomSymbol);
            }
        }
    }

    private forceStop() {
        this.speed = 0;
        this.isStopping = false;

        // snap all symbols exactly to grid
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];

            const targetY = i * LayoutConstant.SYMBOL_HEIGHT;
            symbol.sprite.y = targetY;
        }

        this.applyFinalSymbols();

        if (this.onStopCallback) {
            const cb = this.onStopCallback;
            this.onStopCallback = undefined;
            cb();
        }
    }

    private applyFinalSymbols() {
        for (let i = 0; i < GameConstant.ROWS; i++) {
            const symbol = this.symbols[i];
            const label = this.targetSymbols[i];

            const texture = SymbolFactory.createTexture(label, this.renderer);
            symbol.setSymbol(texture, label);

            symbol.sprite.y = i * LayoutConstant.SYMBOL_HEIGHT;
        }
    }
}