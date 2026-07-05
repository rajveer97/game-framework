import type { Command } from './Command';
import type { HUD } from '../../ui/HUD';

export class DeductBalanceCommand implements Command {
  constructor(private hud: HUD) {}

  async execute(): Promise<void> {
    const currentBalance = this.hud.getBalance();
    const bet = this.hud.getBet();
    this.hud.setBalance(currentBalance - bet);
  }
}
