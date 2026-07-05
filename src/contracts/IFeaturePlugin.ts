import type { SpinContext } from '../framework/context/SpinContext';
import type { ICommand } from '../framework/commands/ICommand';

/**
 * Plugin interface for optional game features (Free Spins, Bonus, Multipliers, etc.)
 *
 * Features self-register with the FeatureRegistry. After each spin result,
 * the registry calls `onSpinResult()` on every registered plugin. If a plugin
 * needs to run (e.g., free spins triggered), it returns the commands to inject.
 *
 * This pattern replaces hardwired FreeSpinsTransitionCommand checks in the pipeline.
 * New features can be added without touching SpinOrchestrator or CommandQueue code.
 *
 * @example
 * ```ts
 * registry.register(new FreeSpinsPlugin(hud, eventBus, config));
 * registry.register(new BonusWheelPlugin(scene, eventBus));
 * ```
 */
export interface IFeaturePlugin {
  /** Unique identifier (e.g., 'freeSpins', 'bonus') */
  readonly id: string;

  /** Human-readable name for logging */
  readonly name: string;

  /**
   * Called by the FeatureRegistry after each spin result is received.
   * If the feature should activate or advance its cycle, return the commands to inject.
   * Return an empty array if the feature has nothing to do this spin.
   *
   * Returned commands are prepended to the CommandQueue BEFORE EnableUI.
   */
  onSpinResult(ctx: SpinContext): ICommand[];

  /** True while the feature is in an active cycle (e.g., during free spins) */
  isActive(): boolean;

  /** Called when the feature transitions from inactive → active */
  onActivate?(): void;

  /** Called when the feature transitions from active → inactive */
  onDeactivate?(): void;

  /** Reset all internal state to initial values */
  reset(): void;
}
