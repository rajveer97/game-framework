import type { Command } from './Command';
import type { HUD } from '../../ui/HUD';

export class EnableUICommand implements Command {
  constructor(
    private hud: HUD,
    private onComplete: () => void
  ) {}

  async execute(): Promise<void> {
    this.hud.setSpinEnabled(true);
    this.onComplete();
  }
}
