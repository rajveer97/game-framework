import type { ICommand } from './ICommand';

export type QueueStatus = 'idle' | 'running' | 'aborted';

export interface CommandQueueHooks {
  /** Fired just before a command begins executing */
  onCommandStart?: (command: ICommand) => void;
  /** Fired immediately after a command resolves successfully */
  onCommandEnd?: (command: ICommand) => void;
  /** Fired when a command throws. Return true to halt the queue. */
  onError?: (command: ICommand, error: unknown) => void;
  /** Fired when the queue drains to empty */
  onQueueEmpty?: () => void;
}

/**
 * Sequential async command queue — the central execution engine.
 *
 * Key behaviours:
 * - Commands execute one at a time, in FIFO order
 * - `batch()` atomically enqueues multiple commands before triggering execution
 * - `prependAll()` allows features to inject commands mid-pipeline
 * - Commands with `canExecute() === false` are silently skipped
 * - `abort()` cancels current execution and clears the queue
 * - `AbortSignal` is forwarded to each command for cooperative cancellation
 *
 * @example
 * ```ts
 * const queue = new CommandQueue({ onQueueEmpty: () => console.log('done') });
 * queue.batch([new SpinCommand(), new ShowWinsCommand(), new EnableUICommand()]);
 * ```
 */
export class CommandQueue {
  private queue: ICommand[] = [];
  private isExecuting = false;
  private abortController: AbortController | null = null;
  private _status: QueueStatus = 'idle';

  constructor(private readonly hooks: CommandQueueHooks = {}) {}

  get status(): QueueStatus {
    return this._status;
  }

  get length(): number {
    return this.queue.length;
  }

  // ─── Enqueueing ────────────────────────────────────────────────────────────

  /** Enqueue a single command and trigger execution if idle */
  add(command: ICommand): this {
    this.queue.push(command);
    this.tryRun();
    return this;
  }

  /**
   * Atomically enqueue multiple commands, then trigger execution once.
   * Always prefer this over multiple sequential `add()` calls.
   */
  batch(commands: ICommand[]): this {
    this.queue.push(...commands);
    this.tryRun();
    return this;
  }

  /**
   * Insert a command at the FRONT of the queue (behind the currently-running
   * command if one is active). Used by features to inject steps mid-pipeline.
   */
  prepend(command: ICommand): this {
    this.queue.unshift(command);
    return this;
  }

  /**
   * Insert multiple commands at the front of the queue, preserving their order.
   * Equivalent to `prepend()` for each command in reverse.
   */
  prependAll(commands: ICommand[]): this {
    this.queue.unshift(...commands);
    return this;
  }

  // ─── Control ───────────────────────────────────────────────────────────────

  /**
   * Abort the currently executing command (sends abort signal) and clear
   * all pending commands. The queue resets to 'aborted' status.
   * Call `reset()` afterwards to allow new commands.
   */
  abort(): void {
    this._status = 'aborted';
    this.abortController?.abort();
    this.abortController = null;
    this.queue = [];
    this.isExecuting = false;
  }

  /** Transition from 'aborted' back to 'idle' so new commands can be accepted */
  reset(): void {
    if (this._status === 'aborted') {
      this._status = 'idle';
    }
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private tryRun(): void {
    if (!this.isExecuting && this._status !== 'aborted') {
      this.runNext();
    }
  }

  private async runNext(): Promise<void> {
    if (this.isExecuting || this._status === 'aborted') return;

    if (this.queue.length === 0) {
      this._status = 'idle';
      this.hooks.onQueueEmpty?.();
      return;
    }

    const command = this.queue.shift()!;

    // canExecute guard — skip the command without error if it returns false
    if (command.canExecute && !command.canExecute()) {
      this.runNext();
      return;
    }

    this.isExecuting = true;
    this._status = 'running';
    this.abortController = new AbortController();
    this.hooks.onCommandStart?.(command);

    try {
      await command.execute(this.abortController.signal);
      this.hooks.onCommandEnd?.(command);
    } catch (error) {
      if (this._status !== 'aborted') {
        this.hooks.onError?.(command, error);
        console.error(`[CommandQueue] "${command.label ?? 'anonymous'}" threw:`, error);
      }
    } finally {
      this.abortController = null;
      this.isExecuting = false;
      if (this._status !== 'aborted') {
        this.runNext();
      }
    }
  }
}
