import * as PIXI from 'pixi.js';
import { Reel } from './Reel';
import type { SpinResult } from 'types/SpinResult';
import { LayoutConstant } from '../constants/LayoutConstant';
import { GameConstant } from '../constants/GameConstant';
import { Assets } from '../core/Assets';
import { AssetKeys } from '../constants/AssetKeys';

export class ReelEngine {
    public reelContainer: PIXI.Container;
    public container: PIXI.Container;

    private reels: Reel[] = [];
    private reelFrame!: PIXI.Sprite;

    constructor(private app: PIXI.Application) {
        this.reelContainer = new PIXI.Container();
        this.reelContainer.pivot.set(0.5)

        this.container = new PIXI.Container();

        this.reelContainer.name = "reelContainer";
        this.container.name = "container";

        this.addReelFrame();

        this.createReels();
        this.createMask();
        this.resizeReelFrame();
    }

    private addReelFrame() {
        const texture = Assets.getTexture(AssetKeys.REEL_FRAME);
        this.reelFrame = new PIXI.Sprite(texture);
        this.reelFrame.anchor.set(0.5);
        // this.reelFrame.x = LayoutConstant.REEL_FRAME_X;
        // this.reelFrame.y = LayoutConstant.REEL_FRAME_Y;
        this.reelContainer.addChild(this.reelFrame);
    }

    private createReels() {
        this.reelContainer.addChild(this.container);
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

    public resizeReelFrame(): void {

        const { width, height } = this.app.screen;

        const scale = Math.min(
            width / this.reelContainer.width,
            height / this.reelContainer.height
        );
        this.reelContainer.scale.set(scale);
        this.reelContainer.position.set(width * 0.5, height * 0.5);
    }
}