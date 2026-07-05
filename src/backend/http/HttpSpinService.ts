import type { ISpinService } from '../ISpinService';
import type { ISpinRequest } from '../ISpinRequest';
import type { ISpinResponse } from '../ISpinResponse';
import { ResponseMapper } from './ResponseMapper';

export interface HttpSpinServiceConfig {
  baseUrl: string;
  sessionToken?: string;
  /** Request timeout in ms. Default: 10000 */
  timeoutMs?: number;
  /** Number of retry attempts after failure. Default: 2 */
  maxRetries?: number;
}

/**
 * Production HTTP spin service using the native Fetch API.
 *
 * Features:
 * - Configurable timeout using AbortController
 * - Exponential-backoff retry logic
 * - Auth header injection (Bearer token)
 * - All server JSON is normalized via ResponseMapper
 * - No third-party HTTP client dependency (fetch is universal)
 */
export class HttpSpinService implements ISpinService {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(private readonly config: HttpSpinServiceConfig) {
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  async spin(request: ISpinRequest): Promise<ISpinResponse> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.performRequest(request);
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          // Exponential backoff: 500ms, 1000ms, ...
          await this.delay(500 * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  private async performRequest(request: ISpinRequest): Promise<ISpinResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(this.config.sessionToken && {
            Authorization: `Bearer ${this.config.sessionToken}`,
          }),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '(empty body)');
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      const json = await response.json();
      return ResponseMapper.map(json);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
