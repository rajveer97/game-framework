import type { ICommand } from '../../framework/commands/ICommand';
import type { IReelController } from '../../contracts/IReelController';
import type { ISpinService } from '../../backend/ISpinService';
import type { IEventBus } from '../../framework/events/IEventBus';
import type { SpinContext } from '../../framework/context/SpinContext';
import type { SlotEvents } from '../SlotEvents';
import type { GameConfig } from '../../framework/config/GameConfig';

/**
 * The core spin command — handles the full reel cycle:
 *
 * 1. Start all reels spinning
 * 2. Simultaneously fetch the result from the backend
 * 3. Enforce a minimum spin duration for visual impact
 * 4. Stop reels sequentially with the server-provided result
 *
 * Parallelizing the fetch with the spin animation means we don't wait
 * for the backend AFTER the reels start — they happen concurrently.
 * The min-duration guard ensures the reels don't stop too abruptly on fast responses.
 *
 * Result is stored on `context.spinResponse` for all subsequent commands.
 */
export class SpinReelsCommand implements ICommand {
  readonly label = 'SpinReels';

  constructor(
    private readonly reelController: IReelController,
    private readonly spinService: ISpinService,
    private readonly context: SpinContext,
    private readonly bus: IEventBus<SlotEvents>,
    private readonly config: GameConfig
  ) {}

  async execute(signal?: AbortSignal): Promise<void> {
    const startTime = Date.now();

    // 1. Start animation immediately
    this.reelController.startSpin();

    // 2. Fetch result from backend (happens in parallel with spinning)
    const result = await this.spinService.spin({
      gameId: this.context.gameId,
      betAmount: this.context.betAmount,
      featureContext: {
        isFreeSpinPhase: this.context.isFreeSpinPhase,
        freeSpinsRemaining: this.context.freeSpinsRemaining,
      },
    });

    // Check for cancellation before proceeding
    if (signal?.aborted) return;

    // Store result on shared context for downstream commands
    this.context.spinResponse = result;
    this.bus.emit('SPIN_RESULT_RECEIVED', result);

    // 3. Enforce minimum spin duration for visual quality
    const elapsed = Date.now() - startTime;
    const remaining = this.config.reels.minSpinDuration - elapsed;
    if (remaining > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, remaining));
    }

    if (signal?.aborted) return;

    // 4. Stop reels sequentially (stagger handled inside PixiReelController)
    await this.reelController.stopSpin(result);
  }
}
