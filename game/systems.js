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
  WINDOW_HEIGHT,
} from './constants';
import SoundManager from './SoundManager';

/* ─── Helper ──────────────────────────────────────── */

const randomGapY = (gap) => {
  const pipeGap = gap || PIPE_GAP;
  const minGapTop = 100;
  const maxGapTop = WINDOW_HEIGHT - FLOOR_HEIGHT - pipeGap - 100;
  return Math.floor(Math.random() * (maxGapTop - minGapTop)) + minGapTop;
};

/* ─── SYSTEM: Physics (gravity + flap) ────────────── */

const Physics = (entities, { touches, time, dispatch }) => {
  const bird = entities.bird;
  if (!bird) return entities;

  const body = bird.body;

  // Use level gravity if available
  const levelConfig = entities.levelConfig;
  const gravity = levelConfig?.gravity || GRAVITY;

  // Apply gravity
  body.velocity.y += gravity * (time.delta / 16.67);

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

const MovePipes = (entities, { time, dispatch }) => {
  const speed = entities.pipeSpeed || PIPE_SPEED;
  const levelConfig = entities.levelConfig;
  const pipeGap = levelConfig?.pipeGap || PIPE_GAP;
  const specials = levelConfig?.specials || [];

  // Speed burst special — random speed variations
  let effectiveSpeed = speed;
  if (specials.includes('speed_bursts')) {
    // Every ~3 seconds, apply a burst
    const burstChance = 0.005; // per frame
    if (Math.random() < burstChance) {
      entities._speedBurst = 60; // frames of burst
    }
    if (entities._speedBurst > 0) {
      effectiveSpeed = speed * 1.5;
      entities._speedBurst -= 1;
    }
  }

  const pipePairs = [
    { top: entities.pipeTop1, bottom: entities.pipeBottom1, scored: 'scored1' },
    { top: entities.pipeTop2, bottom: entities.pipeBottom2, scored: 'scored2' },
  ];

  pipePairs.forEach(({ top, bottom, scored }, idx) => {
    if (!top || !bottom) return;

    // Move pipes left
    top.body.position.x += effectiveSpeed;
    bottom.body.position.x += effectiveSpeed;

    // Moving pipes special — gap oscillates by extending/retracting pipe heights
    if (specials.includes('moving_pipes')) {
      const moveKey = `_pipeMove${idx}`;
      const baseKey = `_pipeBase${idx}`;
      entities[moveKey] = (entities[moveKey] || 0) + 0.025;

      // Store original gap center on first frame
      if (entities[baseKey] === undefined) {
        const topH = top.size[1];
        const bottomH = bottom.size[1];
        entities[baseKey] = topH + pipeGap / 2; // center of gap
      }

      const baseGapCenter = entities[baseKey];
      const oscillation = Math.sin(entities[moveKey]) * 40; // ±40px
      const newGapCenter = baseGapCenter + oscillation;

      // Top pipe: stretches from y=0 down to gap opening
      const newTopHeight = Math.max(30, newGapCenter - pipeGap / 2);
      top.size = [PIPE_WIDTH, newTopHeight];
      top.body.position.y = newTopHeight / 2;

      // Bottom pipe: stretches from gap bottom to floor
      const bottomStart = newTopHeight + pipeGap;
      const newBottomHeight = Math.max(30, FLOOR_Y - bottomStart);
      bottom.size = [PIPE_WIDTH, newBottomHeight];
      bottom.body.position.y = bottomStart + newBottomHeight / 2;
    }

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
      const gapTop = randomGapY(pipeGap);
      const topHeight = gapTop;
      const bottomY = gapTop + pipeGap;
      const bottomHeight = FLOOR_Y - bottomY;

      top.body.position.x = PIPE_SPAWN_X;
      top.body.position.y = topHeight / 2;
      top.size = [PIPE_WIDTH, topHeight];

      bottom.body.position.x = PIPE_SPAWN_X;
      bottom.body.position.y = bottomY + bottomHeight / 2;
      bottom.size = [PIPE_WIDTH, bottomHeight];

      entities[scored] = false;

      // Reset moving pipe base position for new gap
      const baseKey = `_pipeBase${idx}`;
      delete entities[baseKey];
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
  const bRadius = BIRD_SIZE / 2 - 2;

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

/* ─── Export all systems ──────────────────────────── */

export { CollisionDetection, MovePipes, Physics };

export default [Physics, MovePipes, CollisionDetection];
