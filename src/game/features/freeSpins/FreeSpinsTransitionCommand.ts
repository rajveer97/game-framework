import type { ICommand } from '../../../framework/commands/ICommand';
import type { IHUDController } from '../../../contracts/IHUDController';
import type { IEventBus } from '../../../framework/events/IEventBus';
import type { SlotEvents } from '../../SlotEvents';
import type { SpinContext } from '../../../framework/context/SpinContext';
import type { FreeSpinsState } from './FreeSpinsState';

/**
 * Handles the transition INTO a free spin cycle.
 * Injected by FreeSpinsPlugin when a spin result contains freeSpinsAwarded > 0.
 *
 * Responsibilities:
 * 1. Awards the free spins to FreeSpinsState
 * 2. Updates the HUD free spin counter
 * 3. Plays a transition delay for visual drama
 * 4. Emits FREE_SPINS_TRIGGERED so other systems can react (e.g., music change)
 */
export class FreeSpinsTransitionCommand implements ICommand {
  readonly label = 'FreeSpinsTransition';

  constructor(
    private readonly state: FreeSpinsState,
    private readonly hud: IHUDController,
    private readonly bus: IEventBus<SlotEvents>,
    private readonly context: SpinContext,
    private readonly transitionDelayMs: number = 2000
  ) {}

  async execute(): Promise<void> {
    const awarded = this.context.spinResponse?.freeSpinsAwarded ?? 0;
    if (awarded <= 0) return;

    this.state.award(awarded);
    this.hud.setFreeSpins(this.state.getRemaining());

    this.bus.emit('FREE_SPINS_TRIGGERED', { count: awarded });

    console.log(
      `[FreeSpins] Awarded ${awarded} free spins. Total remaining: ${this.state.getRemaining()}`
    );

    // Visual transition delay
    await new Promise<void>(resolve => setTimeout(resolve, this.transitionDelayMs));
  }
}
