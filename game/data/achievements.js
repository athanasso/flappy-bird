/**
 * Achievement definitions for Derpy Disk.
 * Each achievement has conditions checked after every game.
 */

export const ACHIEVEMENTS = [
  {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Complete your first game',
    icon: '🐣',
    check: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Score 5 in a single run',
    icon: '🎯',
    check: (stats) => stats.lastScore >= 5,
  },
  {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: 'Score 10 in a single run',
    icon: '🏹',
    check: (stats) => stats.lastScore >= 10,
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Score 25 in a single run',
    icon: '🔥',
    check: (stats) => stats.lastScore >= 25,
  },
  {
    id: 'king_of_skies',
    name: 'King of the Skies',
    description: 'Score 50 in a single run',
    icon: '👑',
    check: (stats) => stats.lastScore >= 50,
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Score 100 in a single run',
    icon: '💯',
    check: (stats) => stats.lastScore >= 100,
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play 50 total games',
    icon: '🏃',
    check: (stats) => stats.totalGames >= 50,
  },
  {
    id: 'addicted',
    name: 'Totally Addicted',
    description: 'Play 200 total games',
    icon: '🎮',
    check: (stats) => stats.totalGames >= 200,
  },
  {
    id: 'level_5',
    name: 'Halfway There',
    description: 'Unlock Level 5',
    icon: '⭐',
    check: (stats) => stats.unlockedLevel >= 5,
  },
  {
    id: 'level_10',
    name: 'Master Flyer',
    description: 'Unlock Level 10 — Infinity',
    icon: '🌟',
    check: (stats) => stats.unlockedLevel >= 10,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Beat a level with double the required score',
    icon: '💎',
    check: (stats) => stats.doubledGoal === true,
  },
];

/**
 * Check all achievements against current stats.
 * Returns array of newly unlocked achievement IDs.
 */
export const checkAchievements = (stats, alreadyUnlocked = []) => {
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (alreadyUnlocked.includes(achievement.id)) continue;
    if (achievement.check(stats)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
};

/**
 * Get achievement definition by ID.
 */
export const getAchievement = (id) => ACHIEVEMENTS.find((a) => a.id === id);
