export class FreeSpinsManager {
  private remaining = 0;
  private isActive = false;

  awardFreeSpins(count: number) {
    this.remaining += count;
    this.isActive = true;
  }

  decrement() {
    if (this.remaining > 0) {
      this.remaining--;
      if (this.remaining === 0) {
        this.isActive = false;
      }
    }
  }

  getRemaining() {
    return this.remaining;
  }

  isFreeSpinActive() {
    return this.isActive;
  }

  reset() {
    this.remaining = 0;
    this.isActive = false;
  }
}