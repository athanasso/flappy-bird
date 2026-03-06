import Bird from './components/Bird';
import Floor from './components/Floor';
import Pipe from './components/Pipe';
import {
    BIRD_SIZE,
    BIRD_X,
    BIRD_Y,
    FLOOR_HEIGHT,
    FLOOR_Y,
    PIPE_GAP,
    PIPE_SPEED,
    PIPE_WIDTH,
    WINDOW_HEIGHT,
    WINDOW_WIDTH,
} from './constants';

/**
 * Returns the initial gap Y positions for pipes.
 */
const randomGapY = () => {
  const minGapTop = 120;
  const maxGapTop = WINDOW_HEIGHT - FLOOR_HEIGHT - PIPE_GAP - 120;
  return Math.floor(Math.random() * (maxGapTop - minGapTop)) + minGapTop;
};

/**
 * Creates a pipe pair (top + bottom) at a given X position.
 */
const createPipePair = (xPos) => {
  const gapTop = randomGapY();
  const topHeight = gapTop;
  const bottomY = gapTop + PIPE_GAP;
  const bottomHeight = FLOOR_Y - bottomY;

  const top = {
    body: {
      position: { x: xPos, y: topHeight / 2 },
      velocity: { x: 0, y: 0 },
    },
    size: [PIPE_WIDTH, topHeight],
    isTop: true,
    renderer: Pipe,
  };

  const bottom = {
    body: {
      position: { x: xPos, y: bottomY + bottomHeight / 2 },
      velocity: { x: 0, y: 0 },
    },
    size: [PIPE_WIDTH, bottomHeight],
    isTop: false,
    renderer: Pipe,
  };

  return { top, bottom };
};

/**
 * Sets up all game entities – called at start and on restart.
 */
const setupEntities = () => {
  // Bird
  const bird = {
    body: {
      position: { x: BIRD_X, y: BIRD_Y },
      velocity: { x: 0, y: 0 },
    },
    size: [BIRD_SIZE, BIRD_SIZE],
    renderer: Bird,
  };

  // Two pipe pairs — delayed start + wide spacing
  const pipe1X = WINDOW_WIDTH * 2;  // first pipe: ~2 screens away (time to get ready)
  const pipe2X = pipe1X + WINDOW_WIDTH * 0.75;  // second pipe: 75% of a screen after the first
  const pair1 = createPipePair(pipe1X);
  const pair2 = createPipePair(pipe2X);

  // Floor (static)
  const floor = {
    body: {
      position: { x: WINDOW_WIDTH / 2, y: FLOOR_Y + FLOOR_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
    },
    size: [WINDOW_WIDTH, FLOOR_HEIGHT],
    renderer: Floor,
  };

  return {
    bird,
    pipeTop1: pair1.top,
    pipeBottom1: pair1.bottom,
    pipeTop2: pair2.top,
    pipeBottom2: pair2.bottom,
    floor,
    // Scoring flags
    scored1: false,
    scored2: false,
    // Dynamic difficulty
    pipeSpeed: PIPE_SPEED,
  };
};

export default setupEntities;
