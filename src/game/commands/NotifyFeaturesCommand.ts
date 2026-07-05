import type { ICommand } from '../../framework/commands/ICommand';
import type { SpinContext } from '../../framework/context/SpinContext';
import type { CommandQueue } from '../../framework/commands/CommandQueue';
import type { FeatureRegistry } from '../features/FeatureRegistry';

/**
 * Feature notification command — the integration point between the core pipeline
 * and the feature plugin system.
 *
 * After every spin result, this command asks the FeatureRegistry whether any
 * active plugin wants to inject commands. If so, those commands are prepended
 * to the queue and will execute BEFORE the trailing EnableUI command.
 *
 * This pattern means:
 * - The pipeline doesn't need to know about any specific feature
 * - New features (bonus, multiplier, jackpot) can be added without touching
 *   SpinOrchestrator or any other core file
 * - Free spins and bonus games are handled entirely by their own plugins
 */
export class NotifyFeaturesCommand implements ICommand {
  readonly label = 'NotifyFeatures';

  constructor(
    private readonly featureRegistry: FeatureRegistry,
    private readonly queue: CommandQueue,
    private readonly context: SpinContext
  ) {}

  async execute(): Promise<void> {
    const commands = this.featureRegistry.onSpinResult(this.context);

    if (commands.length > 0) {
      // Inject feature commands at the FRONT of the queue.
      // They will run before the next scheduled command (EnableUI).
      this.queue.prependAll(commands);
    }
  }
}
