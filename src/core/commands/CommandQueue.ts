import type { Command } from './Command';

export class CommandQueue {
  private queue: Command[] = [];
  private isExecuting = false;

  add(command: Command) {
    this.queue.push(command);
    this.runNext();
  }

  addFirst(command: Command) {
    this.queue.unshift(command);
    this.runNext();
  }

  clear() {
    this.queue = [];
    this.isExecuting = false;
  }

  private async runNext() {
    if (this.isExecuting || this.queue.length === 0) return;

    this.isExecuting = true;
    const command = this.queue.shift()!;

    try {
      await command.execute();
    } catch (e) {
      console.error('Command execution failed', e);
    } finally {
      this.isExecuting = false;
      this.runNext();
    }
  }

  get length() {
    return this.queue.length;
  }
}
