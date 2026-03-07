import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import SoundManager from '../game/SoundManager';
import Background from '../game/components/Background';
import { SCORE_INTERVAL, SPEED_INCREMENT } from '../game/constants';
import { checkAchievements } from '../game/data/achievements';
import { getLevel, getNextLevel, isLevelComplete } from '../game/data/levels';
import setupEntities from '../game/entities';
import StorageService from '../game/services/StorageService';
import systems from '../game/systems';

const GAME_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  OVER: 'over',
};

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelId = parseInt(params.level as string) || 1;
  const level = getLevel(levelId);

  const [gameState, setGameState] = useState(GAME_STATE.IDLE);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const engineRef = useRef<any>(null);
  const entitiesRef = useRef<any>(null);
  const scoreRef = useRef(0); // non-state ref for systems access

  // Animated values
  const scoreScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const gameOverSlide = useRef(new Animated.Value(50)).current;

  // Preload sounds + load data
  useEffect(() => {
    SoundManager.load();
    loadBestScore();
    return () => {};
  }, []);

  const loadBestScore = async () => {
    const data = await StorageService.load();
    const levelBest = data.levelBestScores?.[String(levelId)] || 0;
    setBestScore(levelBest);
  };

  const animateScore = () => {
    scoreScale.setValue(1.4);
    Animated.spring(scoreScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const showGameOver = () => {
    overlayOpacity.setValue(0);
    gameOverSlide.setValue(50);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(gameOverSlide, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onEvent = useCallback(
    (e: any) => {
      if (e.type === 'score') {
        setScore((prev) => {
          const newScore = prev + 1;
          scoreRef.current = newScore;
          animateScore();
          SoundManager.playScore();

          // Dynamic difficulty within level
          if (newScore % SCORE_INTERVAL === 0 && entitiesRef.current) {
            const currentSpeed = entitiesRef.current.pipeSpeed || level.pipeSpeed;
            entitiesRef.current.pipeSpeed = currentSpeed - SPEED_INCREMENT;
          }

          return newScore;
        });
      } else if (e.type === 'game-over') {
        if (gameState === GAME_STATE.RUNNING) {
          setGameState(GAME_STATE.OVER);
          handleGameOver();
        }
      }
    },
    [gameState, levelId]
  );

  const handleGameOver = async () => {
    const finalScore = scoreRef.current;

    // Record game in storage
    const data = await StorageService.recordGame(finalScore, levelId);

    // Update best score for display
    const levelBest = data.levelBestScores?.[String(levelId)] || 0;
    setBestScore(levelBest);

    // Check level completion
    const completed = isLevelComplete(levelId, finalScore);
    setLevelCompleted(completed);

    if (completed) {
      const nextLevel = getNextLevel(levelId);
      if (nextLevel) {
        await StorageService.unlockLevel(nextLevel.id);
      }
      // Bonus coins for level completion
      await StorageService.addCoins(level.goalScore ? level.goalScore * 2 : 10);
    }

    // Check achievements
    const stats = {
      lastScore: finalScore,
      totalGames: data.totalGames,
      bestScore: data.bestScore,
      unlockedLevel: data.unlockedLevel,
      doubledGoal: level.goalScore ? finalScore >= level.goalScore * 2 : false,
    };
    const existing = data.achievements || [];
    const newlyUnlocked = checkAchievements(stats, existing);

    if (newlyUnlocked.length > 0) {
      for (const id of newlyUnlocked) {
        await StorageService.unlockAchievement(id);
      }
      setNewAchievements(newlyUnlocked);
    }

    // Coins for playing
    await StorageService.addCoins(Math.max(1, Math.floor(finalScore / 2)));

    showGameOver();
    SoundManager.playDie();

    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  const startGame = () => {
    // Apply level config to entities
    const entities = setupEntities();
    entities.pipeSpeed = level.pipeSpeed;
    entities.levelConfig = level; // pass level to systems
    entitiesRef.current = entities;
    scoreRef.current = 0;
    setScore(0);
    setNewAchievements([]);
    setLevelCompleted(false);
    setGameState(GAME_STATE.RUNNING);

    if (engineRef.current) {
      engineRef.current.swap(entities);
      engineRef.current.start();
    }
  };

  const renderIdleScreen = () => (
    <View style={styles.overlay}>
      <View style={styles.levelBanner}>
        <Text style={styles.levelIcon}>{level.icon}</Text>
        <Text style={styles.levelName}>{level.name}</Text>
        <Text style={styles.levelDesc}>{level.description}</Text>
        {level.goalScore && (
          <Text style={styles.goalText}>Goal: Score {level.goalScore}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={startGame}
        activeOpacity={0.8}
      >
        <Text style={styles.playButtonText}>▶  TAP TO PLAY</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToMenuBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.backToMenuText}>← BACK TO MENU</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameOverScreen = () => {
    const isNewBest = score >= bestScore && score > 0;
    const nextLevel = getNextLevel(levelId);

    return (
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.gameOverCard,
            { transform: [{ translateY: gameOverSlide }] },
          ]}
        >
          {/* Level completed banner */}
          {levelCompleted && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>
                ⭐ LEVEL COMPLETE! ⭐
              </Text>
            </View>
          )}

          <Text style={styles.gameOverTitle}>
            {levelCompleted ? 'AWESOME!' : 'GAME OVER'}
          </Text>

          {/* Score board */}
          <View style={styles.scoreBoard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Best</Text>
              <Text style={styles.scoreValueBest}>
                {Math.max(bestScore, score)}
              </Text>
            </View>
          </View>

          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestText}>🏆 NEW BEST!</Text>
            </View>
          )}

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <View style={styles.achievementsUnlocked}>
              <Text style={styles.achievementsTitle}>
                🎉 Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
              </Text>
              {newAchievements.map((id) => {
                const { getAchievement } = require('../game/data/achievements');
                const a = getAchievement(id);
                return a ? (
                  <Text key={id} style={styles.achievementItem}>
                    {a.icon} {a.name}
                  </Text>
                ) : null;
              })}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <Text style={styles.restartButtonText}>↻ RETRY</Text>
            </TouchableOpacity>

            {levelCompleted && nextLevel && (
              <TouchableOpacity
                style={[styles.restartButton, styles.nextLevelButton]}
                onPress={() => router.replace(`/game?level=${nextLevel.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.restartButtonText}>
                  NEXT →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.menuLink}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuLinkText}>← MAIN MENU</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  // Apply level theme
  const themeColors = level.theme;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.sky }]}>
      <StatusBar hidden />

      <View pointerEvents="none" style={styles.engine}>
        <Background theme={level.theme} />
      </View>

      <GameEngine
        ref={engineRef}
        style={styles.engine}
        systems={systems}
        entities={entitiesRef.current || setupEntities()}
        running={gameState === GAME_STATE.RUNNING}
        onEvent={onEvent}
      />

      {/* Level indicator */}
      {gameState === GAME_STATE.RUNNING && (
        <View pointerEvents="none" style={styles.levelIndicator}>
          <Text style={styles.levelIndicatorText}>
            {level.icon} Lv.{level.id}
          </Text>
        </View>
      )}

      {/* Score */}
      {gameState === GAME_STATE.RUNNING && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scoreContainer,
            { transform: [{ scale: scoreScale }] },
          ]}
        >
          <Text style={styles.scoreText}>{score}</Text>
        </Animated.View>
      )}

      {/* Goal progress */}
      {gameState === GAME_STATE.RUNNING && level.goalScore && (
        <View pointerEvents="none" style={styles.goalProgress}>
          <Text style={styles.goalProgressText}>
            {score}/{level.goalScore}
          </Text>
        </View>
      )}

      {gameState === GAME_STATE.IDLE && renderIdleScreen()}
      {gameState === GAME_STATE.OVER && renderGameOverScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  engine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Level indicator
  levelIndicator: {
    position: 'absolute',
    top: 62,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 5,
  },
  levelIndicatorText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Score
  scoreContainer: {
    position: 'absolute',
    top: 55,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: '#333',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  // Goal progress
  goalProgress: {
    position: 'absolute',
    top: 125,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  goalProgressText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  // Idle screen — level banner
  levelBanner: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  levelIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  playButton: {
    backgroundColor: '#5BB33B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#3D8B2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  backToMenuBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backToMenuText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  // Game Over
  gameOverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    maxWidth: 340,
  },
  completedBanner: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  completedText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#333',
    letterSpacing: 1,
  },
  gameOverTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreRow: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
  },
  scoreValueBest: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
  },
  divider: {
    width: 1,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  newBestBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  newBestText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
  },
  // Achievements unlocked
  achievementsUnlocked: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    width: '100%',
  },
  achievementsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 6,
  },
  achievementItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  restartButton: {
    backgroundColor: '#5BB33B',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#3D8B2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  nextLevelButton: {
    backgroundColor: '#3A8FD6',
    borderColor: '#2A6FAA',
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  menuLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  menuLinkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
});
