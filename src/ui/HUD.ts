import * as PIXI from 'pixi.js';
import { EventBus } from '../core/EventBus';

import { LayoutConstant } from '../constants/LayoutConstant';
import { GameConstant } from '../constants/GameConstant';
import { Assets } from '../core/Assets';
import { AssetKeys } from '../constants/AssetKeys';

export class HUD {
    public container = new PIXI.Container();
    private balance = GameConstant.BALANCE;
    private currentBetText: PIXI.Text = new PIXI.Text();
    private balanceText: PIXI.Text = new PIXI.Text();
    private currentWinText: PIXI.Text = new PIXI.Text();
    private freeSpinsText: PIXI.Text = new PIXI.Text();
    private spinButton!: PIXI.Sprite;
    private targetRotation = 0;

    constructor(private bus: EventBus) {
        this.createHUD();
        this.createSpinButton();
    }

    private createHUD() {
        this.setCurrentBet(GameConstant.BET_AMOUNT);
        this.setCurrentWin(0);
        this.setBalance(GameConstant.BALANCE);
        this.setFreeSpins(0);
    }

    public getBalance(): number {
        return this.balance;
    }

    public getBet(): number {
        return GameConstant.BET_AMOUNT;
    }

    public setCurrentBet(currentBet: number) {
        if(this.currentBetText) {
            this.currentBetText.destroy();
        }
        this.currentBetText = new PIXI.Text('Bet: 0', LayoutConstant.MAIN_TEXT_STYLE);
        this.currentBetText.x = LayoutConstant.HUD_X;
        this.currentBetText.y = LayoutConstant.HUD_Y + 30;
        this.container.addChild(this.currentBetText);
        this.currentBetText.text = `Bet: ${currentBet}`;
    }

    public setCurrentWin(currentWin: number) {
        if(this.currentWinText) {
            this.currentWinText.destroy();
        }
        this.currentWinText = new PIXI.Text('Win: 0', LayoutConstant.MAIN_TEXT_STYLE);
        this.currentWinText.x = LayoutConstant.HUD_X;
        this.currentWinText.y = LayoutConstant.HUD_Y + 60;
        this.container.addChild(this.currentWinText);
        this.currentWinText.text = `Win: ${currentWin}`;
    }

    public setBalance(balance: number) {
        this.balance = balance;
        if(this.balanceText) {
            this.balanceText.destroy();
        }
        this.balanceText = new PIXI.Text('Balance: 100', LayoutConstant.MAIN_TEXT_STYLE);
        this.balanceText.x = LayoutConstant.HUD_X;
        this.balanceText.y = LayoutConstant.HUD_Y;
        this.container.addChild(this.balanceText);
        this.balanceText.text = `Balance: ${balance}`;
    }

    public setFreeSpins(freeSpins: number) {
        if(this.freeSpinsText) {
            this.freeSpinsText.destroy();
        }
        this.freeSpinsText = new PIXI.Text('Free Spins: 0', LayoutConstant.FREE_SPINS_TEXT_STYLE);
        this.freeSpinsText.x = LayoutConstant.FREE_SPINS_TEXT_X;
        this.freeSpinsText.y = LayoutConstant.FREE_SPINS_TEXT_Y;
        this.container.addChild(this.freeSpinsText);
        this.freeSpinsText.text = `Free Spins: ${freeSpins}`;
    }

    private createSpinButton() {
        const texture = Assets.getTexture(AssetKeys.SPIN_BUTTON);
        const button = new PIXI.Sprite(texture);
        button.scale.set(0.05);
        button.anchor.set(0.5);
        button.x = LayoutConstant.SPIN_BUTTON_X;
        button.y = LayoutConstant.SPIN_BUTTON_Y;

        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
            this.targetRotation = 0.5;
        });

        button.on('pointerout', () => {
            this.targetRotation = 0;
        });

        button.on('pointerdown', () => {
            this.bus.emit('SPIN_REQUESTED');
        });

        this.container.addChild(button);
        this.spinButton = button;
    }

    setSpinEnabled(enabled: boolean) {
        this.spinButton.eventMode = enabled ? 'static' : 'none';
        this.spinButton.cursor = enabled ? 'pointer' : 'default';
        this.spinButton.alpha = enabled ? 1 : 0.5;
    }

    update(delta: number) {
        const speed = 0.1 * delta;
        this.spinButton.rotation += (this.targetRotation - this.spinButton.rotation) * speed;
    }
}