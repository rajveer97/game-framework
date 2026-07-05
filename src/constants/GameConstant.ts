import { AssetKeys } from '../constants/AssetKeys';

export class GameConstant {
    static readonly WIDTH = 1280;
    static readonly HEIGHT = 720;

    static readonly REELS = 5;
    static readonly ROWS = 3;

    static readonly SYMBOLS = ['A', 'K', 'Q', 'J', 'WILD', 'SCATTER'];

    static readonly SPIN_SPEED = 25;
    static readonly DECELERATION = 0.5;

    static readonly MIN_SPIN_DURATION = 1500;

    static readonly BET_AMOUNT = 10;
    static readonly BALANCE = 1000;

    static readonly FREE_SPINS_COUNT = 10;

    static readonly SymbolToTextureMap: Record<string, string> = {
        A: AssetKeys.SYMBOL_A,
        K: AssetKeys.SYMBOL_K,
        Q: AssetKeys.SYMBOL_Q,
        J: AssetKeys.SYMBOL_J,
        WILD: AssetKeys.SYMBOL_WILD,
        SCATTER: AssetKeys.SYMBOL_SCATTER,
    };
}
