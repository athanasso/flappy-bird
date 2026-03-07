/**
 * Level definitions for Derpy Disk.
 * Each level has unique difficulty, visual theme, and optional special modifiers.
 */

export const LEVELS = [
  {
    id: 1,
    name: 'Lazy Skies',
    description: 'Learn the basics',
    goalScore: 5,
    pipeSpeed: -2,
    pipeGap: 220,
    gravity: 0.3,
    theme: {
      sky: '#87CEEB',
      skyTop: '#5BA8D4',
      mountains: '#8BC99A',
      bushes: '#5DA06A',
      pipes: '#5BB33B',
      pipeBorder: '#3D8B2D',
    },
    icon: '🌤️',
    specials: [],
  },
  {
    id: 2,
    name: 'Breezy Meadow',
    description: 'A gentle breeze picks up',
    goalScore: 10,
    pipeSpeed: -2.2,
    pipeGap: 210,
    gravity: 0.3,
    theme: {
      sky: '#F5C77E',
      skyTop: '#E8935A',
      mountains: '#C47A3A',
      bushes: '#A05A20',
      pipes: '#8B6914',
      pipeBorder: '#6B4F0E',
    },
    icon: '🌿',
    specials: [],
  },
  {
    id: 3,
    name: 'Windy Woods',
    description: 'Trees sway in strong gusts',
    goalScore: 15,
    pipeSpeed: -2.4,
    pipeGap: 200,
    gravity: 0.32,
    theme: {
      sky: '#3A6B4A',
      skyTop: '#2A4A35',
      mountains: '#2D5A38',
      bushes: '#1A3D22',
      pipes: '#5A4020',
      pipeBorder: '#3D2A14',
    },
    icon: '🌲',
    specials: [],
  },
  {
    id: 4,
    name: 'Storm Peaks',
    description: 'Pipes move up and down!',
    goalScore: 20,
    pipeSpeed: -2.5,
    pipeGap: 195,
    gravity: 0.33,
    theme: {
      sky: '#6A5A8A',
      skyTop: '#3D2A5A',
      mountains: '#4A3A6A',
      bushes: '#2D2040',
      pipes: '#706080',
      pipeBorder: '#504060',
    },
    icon: '⛈️',
    specials: ['moving_pipes'],
  },
  {
    id: 5,
    name: 'Thunder Canyon',
    description: 'Narrower gaps, faster pace',
    goalScore: 25,
    pipeSpeed: -2.7,
    pipeGap: 185,
    gravity: 0.34,
    theme: {
      sky: '#2A3A5A',
      skyTop: '#1A2040',
      mountains: '#1E2D45',
      bushes: '#0F1A2A',
      pipes: '#8A5A2A',
      pipeBorder: '#6A4020',
    },
    icon: '⚡',
    specials: ['narrow_pipes'],
  },
  {
    id: 6,
    name: 'Lava Fields',
    description: 'The heat is on',
    goalScore: 30,
    pipeSpeed: -2.9,
    pipeGap: 178,
    gravity: 0.35,
    theme: {
      sky: '#C44E30',
      skyTop: '#8A2A15',
      mountains: '#6A3020',
      bushes: '#4A2015',
      pipes: '#D4650A',
      pipeBorder: '#A04A08',
    },
    icon: '🌋',
    specials: [],
  },
  {
    id: 7,
    name: 'Frozen Abyss',
    description: 'Slippery and cold',
    goalScore: 35,
    pipeSpeed: -3.1,
    pipeGap: 170,
    gravity: 0.28, // lighter gravity = "slippery" floaty feel
    theme: {
      sky: '#D4EEF4',
      skyTop: '#A8D8E8',
      mountains: '#E8F0F4',
      bushes: '#C0D8E4',
      pipes: '#5AAAC8',
      pipeBorder: '#3888A8',
    },
    icon: '❄️',
    specials: ['low_gravity'],
  },
  {
    id: 8,
    name: 'Cosmic Void',
    description: 'Space is dark and fast',
    goalScore: 40,
    pipeSpeed: -3.3,
    pipeGap: 165,
    gravity: 0.36,
    theme: {
      sky: '#0D0D1A',
      skyTop: '#050510',
      mountains: '#15152A',
      bushes: '#0A0A1A',
      pipes: '#2A5ADA',
      pipeBorder: '#1A3AAA',
    },
    icon: '🌌',
    specials: [],
  },
  {
    id: 9,
    name: 'Quantum Flux',
    description: 'Random speed bursts!',
    goalScore: 50,
    pipeSpeed: -3.5,
    pipeGap: 155,
    gravity: 0.37,
    theme: {
      sky: '#1A0A2A',
      skyTop: '#0A0518',
      mountains: '#2A0A3A',
      bushes: '#1A0828',
      pipes: '#E040A0',
      pipeBorder: '#AA2078',
    },
    icon: '⚛️',
    specials: ['speed_bursts'],
  },
  {
    id: 10,
    name: 'Infinity',
    description: 'The ultimate challenge — endless!',
    goalScore: null, // endless
    pipeSpeed: -3.8,
    pipeGap: 150,
    gravity: 0.38,
    theme: {
      sky: '#FFD700',
      skyTop: '#FFA500',
      mountains: '#FF8C00',
      bushes: '#FF6B00',
      pipes: '#FF4500',
      pipeBorder: '#CC3700',
    },
    icon: '♾️',
    specials: ['moving_pipes', 'speed_bursts'],
  },
];

/**
 * Get a level by ID.
 */
export const getLevel = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];

/**
 * Get the next level (or null if at max).
 */
export const getNextLevel = (currentId) => {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

/**
 * Check if a score beats the level goal.
 */
export const isLevelComplete = (levelId, score) => {
  const level = getLevel(levelId);
  if (!level.goalScore) return false; // endless level
  return score >= level.goalScore;
};
