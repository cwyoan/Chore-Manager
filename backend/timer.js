class Timer {
  #time = 0;
  #duration = 0;
  #paused = false;
  #pausedTime = 0;

  /** Initialize and start timer.
   *
   * @param {Number} timerDuration Timer duration in milliseconds.
   */
  constructor(timerDuration) {
    this.#duration = timerDuration;
    this.#time = Date.now();
  }

  /** Return if the timer is complete.
   *
   * @returns {Boolean} If the timer is complete.
   */
  IsDone() {
    return Date.now() - this.#time >= this.#duration;
  }

  /** Return the percent of the time passed.
   *
   * @returns {Number} A value between 0 and 1.
   */
  PercentDone() {
    return Math.min(1, this.TimePassed() / this.#duration);
  }

  /** Return the time remaining before the timer finishes.
   *
   * @returns {Number} Time remaining as milliseconds.
   */
  TimeRemaining() {
    return Math.max(0, this.#duration - this.TimePassed());
  }

  /** Return the amount of time the timer has been running.
   *
   * @returns {Number} Passed time as milliseconds.
   */
  TimePassed() {
    if (this.#paused) return this.#pausedTime;

    return Date.now() - this.#time;
  }

  /** Pause the timer.
   *
   *
   */
  Pause() {
    if (this.#paused) return;

    this.#pausedTime = TimePassed();
    this.#paused = true;
  }

  /**
   *
   * Resume the timer.
   */
  Resume() {
    if (!this.#paused) return;

    this.#time = Date.now() - this.#pausedTime;
    this.#paused = false;

    this.#pausedTime = 0;
  }

  /** Return if the timer is paused.
   *
   * @returns {Boolean} Is paused.
   */
  IsPaused() {
    return this.#paused;
  }
}

export default Timer;
