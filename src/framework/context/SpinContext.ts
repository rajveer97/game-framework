import type { ISpinResponse } from '../../backend/ISpinResponse';
import type { GameConfig } from '../config/GameConfig';

let _idCounter = 0;

/**
 * Mutable context object shared across ALL commands in a single spin pipeline.
 *
 * Created once per spin in SpinOrchestrator, then threaded through every command.
 * Commands read from it (e.g., the result to display) and write to it
 * (e.g., the fetched spin response).
 *
 * Using a context object instead of passing data as command constructor args
 * allows commands at the END of the pipeline to use data produced by commands
 * at the START — without coupling their construction order.
 */
export class SpinContext {
  /** Unique correlation ID for this spin (useful for logging and tracing) */
  readonly id: string;

  /** Bet amount at the time this spin was initiated */
  readonly betAmount: number;

  /** Game ID forwarded to the backend */
  readonly gameId: string;

  /** True when this context belongs to a free spin cycle */
  readonly isFreeSpinPhase: boolean;

  /** Unix timestamp when this spin started */
  readonly timestamp: number;

  /**
   * Populated by SpinReelsCommand after the backend responds.
   * All subsequent commands (ShowWins, UpdateBalance, NotifyFeatures) read from here.
   */
  spinResponse: ISpinResponse | null = null;

  /** Remaining free spins at the time this context was created */
  freeSpinsRemaining: number = 0;

  /** Open-ended bucket for feature-specific data (bonus, multiplier, etc.) */
  featureData: Record<string, unknown> = {};

  constructor(config: GameConfig, options: { isFreeSpinPhase?: boolean } = {}) {
    this.id = `spin-${++_idCounter}`;
    this.betAmount = config.bet.defaultBet;
    this.gameId = config.backend.gameId;
    this.isFreeSpinPhase = options.isFreeSpinPhase ?? false;
    this.timestamp = Date.now();
  }
}
