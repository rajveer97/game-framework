import type { ReelEngine } from "@engine/ReelEngine";
import type { Background } from "./Background";
import type { GameLogo } from "./GameLogo";

export class ResizeManager {
    private background: Background;
    private gameLogo: GameLogo;
    private reelEngine: ReelEngine;

    constructor(background: Background, gameLogo: GameLogo, reelEngine: ReelEngine) {
        this.background = background;
        this.gameLogo = gameLogo;
        this.reelEngine = reelEngine;
    }

    resize() {
        this.background.resizeBackground();
        this.gameLogo.resize();
        this.reelEngine.resizeReelFrame();
    }

}
