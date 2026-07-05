import { GameState } from './GameState';

export interface StateTransition {
  /** The state(s) from which this transition is valid */
  from: GameState | GameState[];
  /** The target state */
  to: GameState;
  /** Optional guard — if returns false, the transition is rejected */
  guard?: () => boolean;
  /** Lifecycle hook: called on the OLD state as it's being exited */
  onExit?: () => void;
  /** Lifecycle hook: called on the NEW state after it's entered */
  onEnter?: () => void;
}

export interface StateChangeEvent {
  from: GameState;
  to: GameState;
}

/**
 * Guard-based finite state machine for game flow management.
 *
 * - All valid transitions must be explicitly registered
 * - Invalid or guard-rejected transitions are no-ops (with console warnings)
 * - Subscribers can react to state changes via `onStateChange()`
 * - `forceState()` bypasses guards for error recovery
 *
 * @example
 * ```ts
 * const sm = new StateMachine();
 * sm.register({ from: GameState.IDLE, to: GameState.SPINNING });
 * sm.register({ from: GameState.SPINNING, to: GameState.SHOWING_WINS });
 *
 * sm.transition(GameState.SPINNING); // true
 * sm.transition(GameState.IDLE);     // false — not registered
 * ```
 */
export class StateMachine {
  private _state: GameState = GameState.IDLE;
  private transitions: StateTransition[] = [];
  private changeListeners: Array<(e: StateChangeEvent) => void> = [];

  get state(): GameState {
    return this._state;
  }

  /** Register a legal state transition */
  register(transition: StateTransition): this {
    this.transitions.push(transition);
    return this;
  }

  /**
   * Attempt a state transition.
   * @returns `true` if successful, `false` if rejected (invalid or guarded)
   */
  transition(to: GameState): boolean {
    const t = this.transitions.find(tr => {
      const froms = Array.isArray(tr.from) ? tr.from : [tr.from];
      return froms.includes(this._state) && tr.to === to;
    });

    if (!t) {
      console.warn(`[StateMachine] No transition registered: ${this._state} → ${to}`);
      return false;
    }

    if (t.guard && !t.guard()) {
      console.warn(`[StateMachine] Transition ${this._state} → ${to} blocked by guard`);
      return false;
    }

    const from = this._state;
    t.onExit?.();
    this._state = to;
    t.onEnter?.();

    const event: StateChangeEvent = { from, to };
    [...this.changeListeners].forEach(cb => {
      try { cb(event); } catch (e) { console.error('[StateMachine] listener threw:', e); }
    });

    return true;
  }

  /**
   * Bypass the transition table and force a specific state.
   * Use only for error recovery or bootstrap initialization.
   */
  forceState(state: GameState): void {
    const from = this._state;
    this._state = state;
    [...this.changeListeners].forEach(cb => cb({ from, to: state }));
  }

  /**
   * Subscribe to state changes.
   * @returns An unsubscribe function
   */
  onStateChange(cb: (e: StateChangeEvent) => void): () => void {
    this.changeListeners.push(cb);
    return () => {
      const idx = this.changeListeners.indexOf(cb);
      if (idx !== -1) this.changeListeners.splice(idx, 1);
    };
  }

  is(state: GameState): boolean {
    return this._state === state;
  }

  isOneOf(...states: GameState[]): boolean {
    return states.includes(this._state);
  }
}
