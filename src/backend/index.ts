import type { ISpinService } from './ISpinService';
import type { GameConfig } from '../framework/config/GameConfig';
import { MockSpinService } from './mock/MockSpinService';
import { HttpSpinService } from './http/HttpSpinService';

/**
 * Factory for creating the spin service based on backend config.
 *
 * Switching from mock to production server requires a single config change:
 * ```ts
 * config.backend.mode = 'http';
 * config.backend.baseUrl = 'https://api.yourgame.com';
 * ```
 *
 * @throws If mode is 'http' but no baseUrl is provided
 */
export function createSpinService(config: GameConfig): ISpinService {
  if (config.backend.mode === 'mock') {
    return new MockSpinService(config);
  }

  if (config.backend.mode === 'http') {
    if (!config.backend.baseUrl) {
      throw new Error('[createSpinService] config.backend.baseUrl is required for http mode');
    }
    return new HttpSpinService({
      baseUrl: config.backend.baseUrl,
      sessionToken: config.backend.sessionToken,
      timeoutMs: config.backend.httpTimeoutMs,
      maxRetries: config.backend.httpMaxRetries,
    });
  }

  throw new Error(`[createSpinService] Unknown backend mode: ${(config.backend as any).mode}`);
}

// Re-export for convenience
export type { ISpinService } from './ISpinService';
export type { ISpinRequest } from './ISpinRequest';
export type { ISpinResponse, IWinLine } from './ISpinResponse';
export { MockSpinService } from './mock/MockSpinService';
export { HttpSpinService } from './http/HttpSpinService';
