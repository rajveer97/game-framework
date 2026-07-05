import type { Command } from './Command';
import type { GameContext } from './GameContext';
import type { WinLayer } from '../../ui/WinLayer';
import type { ReelEngine } from '../../engine/ReelEngine';
import { PAYLINES } from '../../constants/paylines';
import { LayoutConstant } from '../../constants/LayoutConstant';

export class ShowWinsCommand implements Command {
  constructor(
    private winLayer: WinLayer,
    private reelEngine: ReelEngine,
    private context: GameContext
  ) {}

  async execute(): Promise<void> {
    const result = this.context.spinResult;
    if (!result || !result.winLines || result.winLines.length === 0) {
      return;
    }

    this.winLayer.clear();

    result.winLines.forEach(line => {
      const payline = PAYLINES[line.lineIndex];

      for (let reelIndex = 0; reelIndex < line.count; reelIndex++) {
        const rowIndex = payline[reelIndex];
        const reelPos = this.reelEngine.getReelPosition(reelIndex);

        const x = reelPos.x;
        const y = reelPos.y + rowIndex * LayoutConstant.SYMBOL_HEIGHT;

        this.winLayer.highlightSymbol(x, y);
      }
    });

    // Present wins for 1.5 seconds, then clear
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    this.winLayer.clear();
  }
}
