import type { ISpinResponse } from '../backend/ISpinResponse';
import type { SpinContext } from '../framework/context/SpinContext';

/**
 * Strongly-typed event map for the slot game.
 *
 * Used to instantiate EventBus<SlotEvents> in GameBootstrap.
 * Add new events here as the game grows — all subscribers get type-checked automatically.
 */
export type SlotEvents = {
  // ── Input ────────────────────────────────────────────────────────────────
  /** Fired when the player clicks/taps the spin button */
  SPIN_REQUESTED: void;

  // ── Spin Lifecycle ───────────────────────────────────────────────────────
  /** Fired when a spin pipeline begins (after deduct/UI disable) */
  SPIN_STARTED: SpinContext;

  /** Fired when the backend response arrives (reels may still be spinning) */
  SPIN_RESULT_RECEIVED: ISpinResponse;

  /** Fired when the entire spin pipeline (including wins + features) completes */
  SPIN_COMPLETE: SpinContext;

  // ── Win Presentation ─────────────────────────────────────────────────────
  WIN_PRESENTATION_DONE: void;

  // ── Features ─────────────────────────────────────────────────────────────
  FREE_SPINS_TRIGGERED: { count: number };
  FREE_SPINS_UPDATED: { remaining: number };
  FREE_SPINS_COMPLETE: void;

  // ── Economy ──────────────────────────────────────────────────────────────
  BALANCE_UPDATED: { amount: number };
  BET_CHANGED: { amount: number };

  // ── UI / System ──────────────────────────────────────────────────────────
  MUTE_TOGGLED: { muted: boolean };
  AUTO_SPIN_STARTED: { count: number };
  AUTO_SPIN_STOPPED: void;

  /** Unrecoverable error — show error UI */
  ERROR: { message: string; code?: string };
};
