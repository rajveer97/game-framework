import type { ISpinRequest } from './ISpinRequest';
import type { ISpinResponse } from './ISpinResponse';

/**
 * Core backend contract for spin requests.
 *
 * Implementations:
 * - `MockSpinService` — local, randomized results using GameConfig paytable
 * - `HttpSpinService` — production fetch-based client
 *
 * Usage: inject via `createSpinService(config)` factory in `backend/index.ts`
 */
export interface ISpinService {
  spin(request: ISpinRequest): Promise<ISpinResponse>;
}
