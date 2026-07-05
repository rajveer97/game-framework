import type { ICommand } from '../../framework/commands/ICommand';
import type { IHUDController } from '../../contracts/IHUDController';

/**
 * Enables or disables the entire player UI.
 * This command is placed at the START of every spin pipeline (disable)
 * and at the END (enable), ensuring the player cannot double-spin.
 */
export class SetUIEnabledCommand implements ICommand {
  readonly label: string;

  constructor(
    private readonly hud: IHUDController,
    private readonly enabled: boolean,
    private readonly onComplete?: () => void
  ) {
    this.label = enabled ? 'SetUIEnabled(true)' : 'SetUIEnabled(false)';
  }

  async execute(): Promise<void> {
    this.hud.setEnabled(this.enabled);
    this.onComplete?.();
  }
}
