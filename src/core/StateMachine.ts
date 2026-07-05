import { EventBus } from './EventBus';
import { GameState } from '../constants/GameState';

export class StateMachine {
  private state = GameState.IDLE;

  constructor(bus: EventBus) {
    bus.on('SPIN_REQUESTED', this.onSpin);
    bus.on('SPIN_RESULT', this.onResult);
    bus.on('WIN_PRESENTATION_DONE', this.onWinDone);
  }

  private onSpin = () => {
    this.state = GameState.SPINNING;
  };

  private onResult = () => {
    this.state = GameState.RESULT;
  };

  private onWinDone = () => {
    this.state = GameState.IDLE;
  };

  getState() {
    return this.state;
  }
}