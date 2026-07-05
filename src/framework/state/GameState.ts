/**
 * All valid game states. The StateMachine enforces legal transitions between these.
 */
export enum GameState {
  /** Default state — awaiting player input */
  IDLE = 'IDLE',

  /** Reels are spinning (includes fetching result from backend) */
  SPINNING = 'SPINNING',

  /** Reels have stopped, win animations are playing */
  SHOWING_WINS = 'SHOWING_WINS',

  /** Active free spin cycle */
  FREE_SPINS = 'FREE_SPINS',

  /** Bonus game/feature is active */
  BONUS = 'BONUS',

  /** An unrecoverable error occurred */
  ERROR = 'ERROR',
}
