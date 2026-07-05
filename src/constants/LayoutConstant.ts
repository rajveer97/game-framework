import * as PIXI from "pixi.js";

export class LayoutConstant {
    static readonly REEL_START_X = 420;
    static readonly REEL_START_Y = 170;
    static readonly REEL_GAP = 120;

    static readonly SYMBOL_HEIGHT = 110;
    static readonly SYMBOL_WIDTH = 120;

    static readonly HUD_X = 220;
    static readonly HUD_Y = 530;

    static readonly SPIN_BUTTON_X = 1250;
    static readonly SPIN_BUTTON_Y = 300;

    static readonly FREE_SPINS_TEXT_X = 870;
    static readonly FREE_SPINS_TEXT_Y = 520;

    static readonly MAIN_TEXT_STYLE = new PIXI.TextStyle({
        fontFamily: "Comic Sans MS",
        fontSize: 26,
        fontWeight: "bold",
        fill: "#ffffff",
    });

    static readonly FREE_SPINS_TEXT_STYLE = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 20,
        fontWeight: "bold",
        fill: "#ffea00ff",
    });

    static readonly GAME_LOGO_STYLE = new PIXI.TextStyle({
        fontFamily: "Comic Sans MS",
        fill: ['#ff9ff3', '#f368e0'],
        fontSize: 52,
        fontWeight: 'bold',
        stroke: 0xffffff,
        strokeThickness: 6,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 10,
        dropShadowDistance: 2
    });
}