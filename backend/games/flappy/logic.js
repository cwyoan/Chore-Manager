class Logic {
  /** Creates a new instance of flappy game.
   *
   * NOTE: All measurements are measured in a percentage of the screen size.
   *
   * @param {Number} spriteWidth Player sprite width
   * @param {Number} spriteHeight Player sprite height
   * @param {Number} pipeWidth Pipe sprite width
   */

  constructor(spriteWidth, spriteHeight, pipeWidth) {
    this.pos = [0.25, 0.5];
    this.pipes = [];

    // Screen % change per action or second
    this.jumpHeight = 0.2;
    this.jumpSpeed = 1;
    this.grav = 0.1;
    this.vel = 0;

    this.time = Date.now();
    this.count = 5;
    this.offScreen = 0.2;

    this.speed = 0.1;
    this.score = 0;

    this.width = spriteWidth;
    this.height = spriteHeight;
    this.pWidth = pipeWidth;

    for (var i = 1; i <= this.count; i++) {
      this.pipes.push(this.#MakePipe(0.3, [i * (1.5 + this.offScreen), 0.5]));
    }
  }

  /** Trigger a game update.
   *
   * @param {Boolean} flapped Whether the player pressed the jump key this frame.
   * @returns {Boolean} False if the player lost, true otherwise.
   */
  Update(flapped) {
    if (flapped) {
      this.vel = -this.jumpSpeed;
    } else {
      this.vel += this.grav;
    }

    const nextTime = Date.now();
    const dTime = (nextTime - this.time) / 1000;
    this.time = nextTime;

    this.pos[1] += this.vel * dTime;
    if (this.pos[1] <= this.height / 2 || this.pos[1] >= 1) {
      return false;
    }

    for (let pipe of this.pipes) {
      pipe.pos[0] -= this.speed * dTime;

      if (pipe.pos[0] < -this.offScreen) {
        pipe.pos[0] = 1 + this.offScreen;
        pipe.pos[1] = Math.random() * 0.6 + 0.2
        pipe.scored = false;
      } else {
        if (this.#DidCollide(pipe)) return false;

        const playerLeft = this.pos[0] - this.width / 2;
        const pipeRight = pipe.pos[0] - this.pWidth / 2;

        if (!pipe.scored && pipeRight < playerLeft) {
          pipe.scored = true;
          this.score++;
        }
      }
    }

    return true;
  }

  GetPipes() {
    return this.pipes;
  }

  /** Tuple of player coords
   *
   * @returns Player coords
   */
  GetPlayer() {
    return this.pos;
  }

  GetScore() {
    return this.score;
  }

  #DidCollide(pipe) {
    const[playerX, playerY] = this.pos;
    const[pipeX, pipeY] = pipe.pos;

    const playerTop = playerY + this.height / 2;
    const playerBottom = playerY - this.height / 2;
    const playerLeft = playerX - this.width / 2;
    const playerRight = playerX + this.width / 2;

    const gapTop = pipeY + pipe.gap / 2;
    const gapBottom = pipeY - pipe.gap / 2;
    const pipeLeft = pipeX - this.pWidth / 2;
    const pipeRight = pipeX + this.pWidth / 2;

    const horizontalCollision = playerRight > pipeLeft && playerLeft < pipeRight;
    const verticalCollision = playerTop > gapTop || playerBottom < gapBottom;

    return horizontalCollision && verticalCollision;
  }

  #MakePipe(gapSize, startPos) {
    return {
      pos: startPos,
      gap: gapSize,
      scored: false,
    };
  }
}

export default Logic;
