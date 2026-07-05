/**
 * Core command interface. Every game action (spin, show wins, deduct balance, etc.)
 * implements this interface and runs through the CommandQueue.
 */
export interface ICommand {
  /** Human-readable identifier for debugging/logging */
  readonly label?: string;

  /**
   * Executes the command. Resolves when the command is fully complete.
   * @param signal - Optional AbortSignal to support cancellation mid-execution
   */
  execute(signal?: AbortSignal): Promise<void>;

  /**
   * Optional guard. If provided and returns false, the command is skipped
   * without error. Useful for conditional steps in the pipeline.
   */
  canExecute?(): boolean;
}
