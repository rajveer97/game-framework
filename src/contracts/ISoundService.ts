/**
 * Sound playback service interface.
 *
 * Can be implemented using the Web Audio API, Howler.js, or any audio library.
 * A NullSoundService (no-op implementation) can be used in test environments.
 */
export interface ISoundService {
  /** Play a sound asset by key */
  play(key: string, options?: { loop?: boolean; volume?: number }): void;

  /** Stop a specific sound */
  stop(key: string): void;

  /** Stop all currently playing sounds */
  stopAll(): void;

  /** Set the volume for a specific sound (0–1) */
  setVolume(key: string, volume: number): void;

  /** Set master volume for all sounds (0–1) */
  setMasterVolume(volume: number): void;

  isMuted(): boolean;
  setMuted(muted: boolean): void;
}
