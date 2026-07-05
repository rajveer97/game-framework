import type { ISoundService } from '../contracts/ISoundService';
import type { PixiAssetStore } from './PixiAssetStore';

/**
 * HTML Audio-based sound service.
 *
 * Uses HTMLAudioElement loaded by PixiAssetStore.
 * For advanced needs (spatial audio, complex mixing), replace this with
 * a Howler.js or Web Audio API implementation of ISoundService.
 */
export class PixiSoundService implements ISoundService {
  private masterVolume = 1;
  private muted = false;
  private playing = new Map<string, HTMLAudioElement>();

  constructor(private readonly assetStore: PixiAssetStore) {}

  play(key: string, options: { loop?: boolean; volume?: number } = {}): void {
    try {
      const audio = this.assetStore.getAudio(key);
      audio.currentTime = 0;
      audio.loop = options.loop ?? false;
      audio.volume = this.muted ? 0 : (options.volume ?? 1) * this.masterVolume;
      audio.play().catch(() => {
        // Browsers block autoplay before user interaction — safe to ignore
      });
      this.playing.set(key, audio);
    } catch {
      // Audio asset may not be loaded — non-fatal
    }
  }

  stop(key: string): void {
    const audio = this.playing.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.playing.delete(key);
    }
  }

  stopAll(): void {
    this.playing.forEach((audio, key) => this.stop(key));
  }

  setVolume(key: string, volume: number): void {
    const audio = this.playing.get(key);
    if (audio) audio.volume = this.muted ? 0 : volume * this.masterVolume;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.playing.forEach(audio => {
      audio.volume = this.muted ? 0 : this.masterVolume;
    });
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.playing.forEach(audio => {
      audio.volume = muted ? 0 : this.masterVolume;
    });
  }
}
