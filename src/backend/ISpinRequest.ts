/**
 * Payload sent to the backend with every spin request.
 * Both MockSpinService and HttpSpinService receive this type.
 */
export interface ISpinRequest {
  gameId: string;
  betAmount: number;

  /** Server-side session authentication token */
  sessionToken?: string;

  /**
   * Feature context forwarded to the server for server-side feature handling.
   * (e.g., free spin phase, active multiplier, bonus state)
   */
  featureContext?: {
    isFreeSpinPhase?: boolean;
    freeSpinsRemaining?: number;
    [key: string]: unknown;
  };
}
