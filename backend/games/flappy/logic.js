class Logic {
  pos = (0.2, 0.75);
  pipes = [];

  // Screen % change per action or second
  jumpHeight = 0.2;
  jumpSpeed = 0.3;
  grav = 0.2;
  vel = 0;
  time = 0;
  count = 5;
  offScreen = 0.2;

  speed = 0.1;
  score = 0;

  width = 0;
  height = 0;

  pWidth = 0;

  /** Creates a new instance of flappy game.
   *
   * NOTE: All measurements are measured in a percentage of the screen size.
   *
   * @param {Number} spriteWidth Player sprite width
   * @param {Number} spriteHeight Player sprite height
   * @param {Number} pipeWidth Pipe sprite width
   */
  constructor(spriteWidth, spriteHeight, pipeWidth) {
    time = Date.now();

    for (var i = 1; i <= count; i++) {
      pipes.push(this.#MakePipe(0.15, (i * (1 + this.offScreen), 0.5)));
    }

    this.width = spriteWidth;
    this.height = spriteHeight;
    this.pWidth = pipeWidth;
  }

  /** Trigger a game update.
   *
   * @param {Boolean} flapped Whether the player pressed the jump key this frame.
   * @returns {Boolean} False if the player lost, true otherwise.
   */
  Update(flapped) {
    if (flapped) {
      vel = this.jumpSpeed;
    } else {
      vel -= this.grav;
    }

    nextTime = Date.now();

    dTime = (nextTime - time) / 1000;

    pos[1] += this.vel * dTime;

    if (pos[1] <= this.height / 2) return false;

    time = nextTime;

    for (pipe in pipes) {
      pipe.pos[0] -= speed * dTime;

      if (pipe.pos[0] < -this.offScreen) {
        pipe.pos[0] = 1 + this.offScreen;
        pipe.scored = false;
      } else {
        if (this.#DidCollide(pipe)) return false;
        if (pipe.scored || pipe.pos[0] > pos[0]) continue;

        pipe.scored = true;
        this.score++;
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
    return pos;
  }

  GetScore() {
    return this.score;
  }

  #DidCollide(pipe) {
    tl = (pipe.pos[0] - pipe.gap / 2, pipe.pos[1] + pWidth / 2);
    tr = (pipe.pos[0] + pipe.gap / 2, pipe.pos[1] + pWidth / 2);
    bl = (pipe.pos[0] - pipe.gap / 2, pipe.pos[1] - pWidth / 2);
    br = (pipe.pos[0] + pipe.gap / 2, pipe.pos[1] - pWidth / 2);

    ftl = (pos[0] - width / 2, pos[1] + height / 2);
    ftr = (pos[0] + width / 2, pos[1] + height / 2);
    fbl = (pos[0] - width / 2, pos[1] - height / 2);
    fbr = (pos[0] + width / 2, pos[1] - height / 2);

    return (
      (ftl[0] > tl[0] && ftl[0] < tr[0] && ftl[1] > tl[1]) ||
      (ftr[0] > tl[0] && ftr[0] < tr[0] && ftr[1] > tl[1]) ||
      (fbl[0] > bl[0] && fbl[0] < br[0] && fbl[1] < bl[1]) ||
      (fbr[0] > bl[0] && fbr[0] < br[0] && fbr[1] < bl[1])
    );
  }

  #MakePipe(gapSize, startPos) {
    var pipe = {
      pos: startPos,
      gap: gapSize,
      scored: false,
    };

    return pipe;
  }
}

export default Logic;
