/**
 * Generic strongly-typed event bus interface.
 *
 * @template TEvents - A Record mapping event names to their payload types.
 *
 * @example
 * ```ts
 * type MyEvents = { USER_CLICKED: { x: number; y: number }; GAME_OVER: void };
 * const bus: IEventBus<MyEvents> = new EventBus<MyEvents>();
 * const unsub = bus.on('USER_CLICKED', ({ x, y }) => console.log(x, y));
 * bus.emit('USER_CLICKED', { x: 10, y: 20 });
 * unsub(); // clean up listener
 * ```
 */
export interface IEventBus<TEvents extends Record<string, unknown>> {
  /**
   * Subscribe to an event.
   * @returns An unsubscribe function — call it to remove the listener
   */
  on<K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void
  ): () => void;

  /**
   * Subscribe to an event exactly once, then auto-unsubscribe.
   * @returns An unsubscribe function for early cancellation
   */
  once<K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void
  ): () => void;

  /** Unsubscribe a specific handler from an event */
  off<K extends keyof TEvents>(event: K, handler: Function): void;

  /** Emit an event with its payload */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}
