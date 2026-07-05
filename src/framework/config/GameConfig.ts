// ─────────────────────────────────────────────────────────────────────────────
// GameConfig — Single source of truth for all game configuration.
// Pass this object through the dependency injection chain.
// ─────────────────────────────────────────────────────────────────────────────

export interface BackendConfig {
  /** 'mock' for offline dev/QA, 'http' for production server */
  mode: 'mock' | 'http';
  /** Required when mode is 'http' */
  baseUrl?: string;
  gameId: string;
  sessionToken?: string;
  /** Simulated network latency for mock mode (ms). Default: 500 */
  mockDelay?: number;
  /** HTTP request timeout (ms). Default: 10000 */
  httpTimeoutMs?: number;
  /** Number of retries on HTTP failure. Default: 2 */
  httpMaxRetries?: number;
}

export interface ReelConfig {
  reelCount: number;
  rowCount: number;
  /** Ordered array of symbol IDs. Index = symbol number. e.g. ['A','K','Q','J','WILD','SCATTER'] */
  symbols: string[];
  /** Pixels per frame during spin */
  spinSpeed: number;
  /** Speed subtracted per frame when decelerating */
  deceleration: number;
  /** Minimum time reels spin before stopping (ms) */
  minSpinDuration: number;
  /** Stagger delay between each successive reel stopping (ms) */
  reelStopDelay: number;
}

export interface BetConfig {
  defaultBet: number;
  minBet: number;
  maxBet: number;
  betLevels: number[];
  startingBalance: number;
}

export interface PaytableEntry {
  /**
   * Payout for 1, 2, 3, 4, 5 matching symbols.
   * Index 0 = 1 match, index 4 = 5 matches.
   * Use 0 for non-paying counts.
   */
  payouts: [number, number, number, number, number];
  isWild?: boolean;
  isScatter?: boolean;
}

export interface PaytableConfig {
  /** Map of symbol ID → payout definition */
  entries: Record<string, PaytableEntry>;
  /** Each payline is an array of rowIndex per reel. Length == reelCount */
  paylines: number[][];
  /** Scatter count required to trigger free spins */
  scatterTriggerCount?: number;
  /** Free spins awarded when scatter trigger fires */
  freeSpinsAwardCount?: number;
}

export interface AssetEntry {
  key: string;
  url: string;
  type: 'image' | 'audio' | 'atlas';
}

export interface RendererConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  antialias?: boolean;
  resolution?: number;
}

export interface LayoutConfig {
  reelStartX: number;
  reelStartY: number;
  reelGap: number;
  symbolWidth: number;
  symbolHeight: number;
  hudX: number;
  hudY: number;
  spinButtonX: number;
  spinButtonY: number;
  freeSpinsTextX: number;
  freeSpinsTextY: number;
}

export interface GameConfig {
  renderer: RendererConfig;
  layout: LayoutConfig;
  reels: ReelConfig;
  bet: BetConfig;
  paytable: PaytableConfig;
  assets: AssetEntry[];
  backend: BackendConfig;
  /** Enable verbose command/event logging in the console */
  debug?: boolean;
}
