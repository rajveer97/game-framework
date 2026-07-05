import type { SpinResult } from "types/SpinResult";

export type Events = {
  SPIN_REQUESTED: void;
  SPIN_RESULT: SpinResult;
  WIN_PRESENTATION_DONE: void;
  FREE_SPINS_UPDATED: number;
};

export class EventBus {
  private listeners = new Map<keyof Events, Function[]>();

  on<K extends keyof Events>(event: K, cb: (data: Events[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(cb);
  }

  emit<K extends keyof Events>(event: K, data?: Events[K]) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}