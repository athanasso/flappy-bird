import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@derpy_disk_data';

const DEFAULT_DATA = {
  bestScore: 0,
  totalGames: 0,
  totalScore: 0,
  unlockedLevel: 1,
  levelBestScores: {}, // { "1": 12, "2": 8, ... }
  achievements: [],     // ["first_flight", "sharp_shooter", ...]
  coins: 0,
  dailyChallenge: null,
  lastPlayed: null,
};

class StorageServiceClass {
  constructor() {
    this.data = { ...DEFAULT_DATA };
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return this.data;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = { ...DEFAULT_DATA, ...JSON.parse(raw) };
      }
      this.loaded = true;
    } catch (err) {
      console.warn('Failed to load game data:', err);
    }
    return this.data;
  }

  async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('Failed to save game data:', err);
    }
  }

  getData() {
    return this.data;
  }

  // ─── Score & Stats ─────────────────────────────
  async recordGame(score, levelId) {
    this.data.totalGames += 1;
    this.data.totalScore += score;
    this.data.lastPlayed = new Date().toISOString();

    if (score > this.data.bestScore) {
      this.data.bestScore = score;
    }

    // Track per-level best
    const key = String(levelId);
    const prev = this.data.levelBestScores[key] || 0;
    if (score > prev) {
      this.data.levelBestScores[key] = score;
    }

    await this.save();
    return this.data;
  }

  // ─── Level Unlocking ───────────────────────────
  async unlockLevel(levelId) {
    if (levelId > this.data.unlockedLevel) {
      this.data.unlockedLevel = levelId;
      await this.save();
    }
  }

  isLevelUnlocked(levelId) {
    return levelId <= this.data.unlockedLevel;
  }

  // ─── Achievements ─────────────────────────────
  hasAchievement(id) {
    return this.data.achievements.includes(id);
  }

  async unlockAchievement(id) {
    if (!this.hasAchievement(id)) {
      this.data.achievements.push(id);
      await this.save();
      return true; // newly unlocked
    }
    return false; // already had it
  }

  // ─── Coins ────────────────────────────────────
  async addCoins(amount) {
    this.data.coins += amount;
    await this.save();
  }

  // ─── Reset (for testing) ──────────────────────
  async reset() {
    this.data = { ...DEFAULT_DATA };
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

const StorageService = new StorageServiceClass();
export default StorageService;
