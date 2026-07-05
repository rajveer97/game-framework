import * as PIXI from 'pixi.js';
import { Reel } from './Reel';
import type { SpinResult } from 'types/SpinResult';
import { LayoutConstant } from '../constants/LayoutConstant';
import { GameConstant } from '../constants/GameConstant';

export class ReelEngine {
    public container = new PIXI.Container();
    private reels: Reel[] = [];

    constructor(private app: PIXI.Application) {
        this.createReels();
        this.createMask();
    }

    private createReels() {
        for (let i = 0; i < GameConstant.REELS; i++) {
            const reel = new Reel(i, this.app.renderer as PIXI.Renderer);

            reel.container.x = LayoutConstant.REEL_START_X + i * LayoutConstant.REEL_GAP;
            reel.container.y = LayoutConstant.REEL_START_Y;

            this.reels.push(reel);
            this.container.addChild(reel.container);
        }
    }

    private createMask() {
        const mask = new PIXI.Graphics();

        const width = LayoutConstant.SYMBOL_WIDTH * GameConstant.REELS + LayoutConstant.REEL_GAP * (GameConstant.REELS - 1);
        const height = LayoutConstant.SYMBOL_HEIGHT * GameConstant.ROWS;

        mask.beginFill(0xffffff);
        mask.drawRect(LayoutConstant.REEL_START_X, LayoutConstant.REEL_START_Y, width, height);
        mask.endFill();

        this.container.addChild(mask);

        // Apply mask
        this.container.mask = mask;
    }

    public startSpin() {
        this.reels.forEach(r => r.startSpin());
    }

    public async stopSpin(result: SpinResult): Promise<void> {
        const stopPromises = this.reels.map((reel, index) => {
            return new Promise<void>((resolve) => {
                setTimeout(async () => {
                    await reel.stopSpin(result.reels[index]);
                    resolve();
                }, index * 400);
            });
        });

        await Promise.all(stopPromises);
    }

    public getReelPosition(index: number) {
        const reel = this.reels[index];
        return {
            x: reel.container.x,
            y: reel.container.y
        };
    }

    update(delta: number) {
        this.reels.forEach(r => r.update(delta));
    }
}