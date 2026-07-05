import type { IEventBus } from './IEventBus';

/**
 * Typed event bus implementation with memory-leak-safe subscriptions.
 *
 * - All listeners are stored in a Map<event, Set<handler>> for O(1) add/remove
 * - `on()` returns an unsubscribe function — always call it on cleanup
 * - Handlers are snapshot-copied before iteration to survive mid-emit mutations
 * - Handler errors are caught and logged so one bad listener can't break others
 *
 * @example
 * ```ts
 * const bus = new EventBus<SlotEvents>();
 *
 * const unsub = bus.on('SPIN_REQUESTED', () => startSpin());
 * bus.emit('SPIN_REQUESTED', undefined);
 * unsub(); // cleanup when done
 * ```
 */
export class EventBus<TEvents extends Record<string, unknown>>
  implements IEventBus<TEvents>
{
  private handlers = new Map<keyof TEvents, Set<Function>>();

  on<K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void
  ): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler);

    // Return an unsubscribe function
    return () => this.off(event, handler);
  }

  once<K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void
  ): () => void {
    const wrapper = (data: TEvents[K]) => {
      handler(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof TEvents>(event: K, handler: Function): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const set = this.handlers.get(event);
    if (!set || set.size === 0) return;

    // Snapshot before iterating so mid-emit add/remove doesn't affect this cycle
    const snapshot = [...set];
    for (const h of snapshot) {
      try {
        h(data);
      } catch (err) {
        console.error(`[EventBus] Handler for "${String(event)}" threw:`, err);
      }
    }
  }
}
