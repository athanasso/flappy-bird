import {
  BIRD_SIZE,
  FLAP_VELOCITY,
  FLOOR_HEIGHT,
  FLOOR_Y,
  GRAVITY,
  MAX_VELOCITY,
  PIPE_GAP,
  PIPE_SPAWN_X,
  PIPE_SPEED,
  PIPE_WIDTH,
  WINDOW_HEIGHT
} from './constants';
import SoundManager from './SoundManager';

/* ─── Helper ──────────────────────────────────────── */

const randomGapY = () => {
  const minGapTop = 100;
  const maxGapTop = WINDOW_HEIGHT - FLOOR_HEIGHT - PIPE_GAP - 100;
  return Math.floor(Math.random() * (maxGapTop - minGapTop)) + minGapTop;
};

/* ─── SYSTEM: Physics (gravity + flap) ────────────── */

const Physics = (entities, { touches, time, dispatch }) => {
  const bird = entities.bird;
  if (!bird) return entities;

  const body = bird.body;

  // Apply gravity
  body.velocity.y += GRAVITY * (time.delta / 16.67); // normalize to ~60fps

  // Clamp max fall speed
  if (body.velocity.y > MAX_VELOCITY) {
    body.velocity.y = MAX_VELOCITY;
  }

  // Flap on touch — only use 'start' to avoid double-firing
  const hasFlap = touches.some((t) => t.type === 'start');
  if (hasFlap) {
    body.velocity.y = FLAP_VELOCITY;
    SoundManager.playFlap();
  }

  // Update position
  body.position.y += body.velocity.y;

  return entities;
};

/* ─── SYSTEM: Pipe Movement ───────────────────────── */

const MovePipes = (entities, { dispatch }) => {
  const speed = entities.pipeSpeed || PIPE_SPEED;

  const pipePairs = [
    { top: entities.pipeTop1, bottom: entities.pipeBottom1, scored: 'scored1' },
    { top: entities.pipeTop2, bottom: entities.pipeBottom2, scored: 'scored2' },
  ];

  pipePairs.forEach(({ top, bottom, scored }) => {
    if (!top || !bottom) return;

    // Move pipes left
    top.body.position.x += speed;
    bottom.body.position.x += speed;

    // Check if bird passed pipes (for scoring)
    const bird = entities.bird;
    if (bird && !entities[scored]) {
      if (top.body.position.x + PIPE_WIDTH / 2 < bird.body.position.x) {
        entities[scored] = true;
        dispatch({ type: 'score' });
      }
    }

    // Respawn pipe when it goes off-screen left
    if (top.body.position.x < -PIPE_WIDTH) {
      const gapTop = randomGapY();
      const topHeight = gapTop;
      const bottomY = gapTop + PIPE_GAP;
      const bottomHeight = FLOOR_Y - bottomY;

      top.body.position.x = PIPE_SPAWN_X;
      top.body.position.y = topHeight / 2;
      top.size = [PIPE_WIDTH, topHeight];

      bottom.body.position.x = PIPE_SPAWN_X;
      bottom.body.position.y = bottomY + bottomHeight / 2;
      bottom.size = [PIPE_WIDTH, bottomHeight];

      entities[scored] = false;
    }
  });

  return entities;
};

/* ─── SYSTEM: Collision Detection ─────────────────── */

const CollisionDetection = (entities, { dispatch }) => {
  const bird = entities.bird;
  if (!bird) return entities;

  const bx = bird.body.position.x;
  const by = bird.body.position.y;
  const bRadius = BIRD_SIZE / 2 - 2; // slightly smaller for forgiving hitbox

  // Floor collision
  if (by + bRadius >= FLOOR_Y) {
    SoundManager.playHit();
    dispatch({ type: 'game-over' });
    return entities;
  }

  // Ceiling collision
  if (by - bRadius <= 0) {
    bird.body.position.y = bRadius;
    bird.body.velocity.y = 0;
  }

  // Pipe collisions
  const pipes = [
    entities.pipeTop1,
    entities.pipeBottom1,
    entities.pipeTop2,
    entities.pipeBottom2,
  ];

  for (const pipe of pipes) {
    if (!pipe) continue;

    const px = pipe.body.position.x;
    const py = pipe.body.position.y;
    const [pw, ph] = pipe.size;

    const pipeLeft = px - pw / 2;
    const pipeRight = px + pw / 2;
    const pipeTop = py - ph / 2;
    const pipeBottom = py + ph / 2;

    // AABB vs circle collision
    const closestX = Math.max(pipeLeft, Math.min(bx, pipeRight));
    const closestY = Math.max(pipeTop, Math.min(by, pipeBottom));

    const distX = bx - closestX;
    const distY = by - closestY;
    const distSq = distX * distX + distY * distY;

    if (distSq < bRadius * bRadius) {
      SoundManager.playHit();
      dispatch({ type: 'game-over' });
      return entities;
    }
  }

  return entities;
};

/* ─── SYSTEM: Dynamic Difficulty ──────────────────── */

const DifficultyScaling = (entities, { dispatch }) => {
  // Speed is stored on entities so it persists across frames
  // It's updated by the score handler in the game screen
  return entities;
};

/* ─── Export all systems ──────────────────────────── */

export { CollisionDetection, DifficultyScaling, MovePipes, Physics };

export default [Physics, MovePipes, CollisionDetection];
