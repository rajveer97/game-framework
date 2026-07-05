import type { IFeaturePlugin } from '../../contracts/IFeaturePlugin';
import type { SpinContext } from '../../framework/context/SpinContext';
import type { ICommand } from '../../framework/commands/ICommand';

/**
 * Registry for all active game feature plugins.
 *
 * Features register themselves here at bootstrap time.
 * After each spin, `onSpinResult()` is called on every registered plugin.
 * Any commands returned are injected into the pipeline by NotifyFeaturesCommand.
 *
 * @example
 * ```ts
 * const registry = new FeatureRegistry();
 * registry.register(new FreeSpinsPlugin(hud, bus, config));
 * registry.register(new BonusPlugin(bonusScene, bus));
 *
 * // After spin result:
 * const cmds = registry.onSpinResult(context);
 * if (cmds.length) queue.prependAll(cmds);
 * ```
 */
export class FeatureRegistry {
  private plugins: IFeaturePlugin[] = [];

  /** Register a feature plugin */
  register(plugin: IFeaturePlugin): this {
    if (this.plugins.some(p => p.id === plugin.id)) {
      console.warn(`[FeatureRegistry] Plugin "${plugin.id}" already registered`);
      return this;
    }
    this.plugins.push(plugin);
    return this;
  }

  /** Unregister a feature plugin by ID */
  unregister(id: string): void {
    const idx = this.plugins.findIndex(p => p.id === id);
    if (idx !== -1) this.plugins.splice(idx, 1);
  }

  /**
   * Call all plugins with the spin result.
   * Collects and returns all injected commands in registration order.
   */
  onSpinResult(ctx: SpinContext): ICommand[] {
    const commands: ICommand[] = [];

    for (const plugin of this.plugins) {
      try {
        const cmds = plugin.onSpinResult(ctx);
        commands.push(...cmds);
      } catch (err) {
        console.error(`[FeatureRegistry] Plugin "${plugin.id}" threw in onSpinResult:`, err);
      }
    }

    return commands;
  }

  /** Get all currently active plugins */
  getActivePlugins(): IFeaturePlugin[] {
    return this.plugins.filter(p => p.isActive());
  }

  /** Reset all plugins to their initial state */
  resetAll(): void {
    this.plugins.forEach(p => p.reset());
  }

  get size(): number {
    return this.plugins.length;
  }
}
