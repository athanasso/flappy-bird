import { createAudioPlayer } from 'expo-audio';

/**
 * Sound manager for Derpy Disk using expo-audio.
 * Uses createAudioPlayer for imperative control outside component lifecycle.
 *
 * Usage:
 *   await SoundManager.load();
 *   SoundManager.playFlap();
 *   SoundManager.playScore();
 *   SoundManager.playHit();
 *   SoundManager.playDie();
 */

// Sound file imports
const SOUND_FILES = {
  flap: require('../assets/sounds/flap.wav'),
  score: require('../assets/sounds/score.wav'),
  hit: require('../assets/sounds/hit.wav'),
  die: require('../assets/sounds/die.wav'),
};

class SoundManagerClass {
  constructor() {
    this.players = {};
    this.loaded = false;
    this.muted = false;
  }

  /**
   * Preload all sounds. Call once at app start.
   */
  async load() {
    if (this.loaded) return;

    try {
      for (const [key, source] of Object.entries(SOUND_FILES)) {
        const player = createAudioPlayer(source);
        player.volume = 0.7;
        this.players[key] = player;
      }

      this.loaded = true;
      console.log('🔊 Sounds loaded successfully');
    } catch (err) {
      console.warn('⚠️ Failed to load sounds:', err);
    }
  }

  /**
   * Play a sound by key. Seeks to start before playing
   * so the same sound can be triggered rapidly.
   */
  _play(key) {
    if (this.muted || !this.loaded) return;

    try {
      const player = this.players[key];
      if (player) {
        // Seek to beginning and play
        player.seekTo(0);
        player.play();
      }
    } catch (err) {
      // Silently ignore playback errors during gameplay
    }
  }

  playFlap() {
    this._play('flap');
  }

  playScore() {
    this._play('score');
  }

  playHit() {
    this._play('hit');
  }

  playDie() {
    this._play('die');
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Cleanup – release all players.
   */
  async unload() {
    for (const player of Object.values(this.players)) {
      try {
        player.remove();
      } catch (_) {}
    }
    this.players = {};
    this.loaded = false;
  }
}

// Singleton
const SoundManager = new SoundManagerClass();
export default SoundManager;
