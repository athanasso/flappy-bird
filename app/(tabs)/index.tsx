import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Background from '../../game/components/Background';
import {
    COLORS,
    PIPE_SPEED,
    SCORE_INTERVAL,
    SPEED_INCREMENT
} from '../../game/constants';
import setupEntities from '../../game/entities';
import SoundManager from '../../game/SoundManager';
import systems from '../../game/systems';

const GAME_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  OVER: 'over',
};

export default function GameScreen() {
  const [gameState, setGameState] = useState(GAME_STATE.IDLE);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const engineRef = useRef<any>(null);
  const entitiesRef = useRef<any>(null);

  // Animated values for UI elements
  const scoreScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const gameOverSlide = useRef(new Animated.Value(50)).current;

  // Preload sounds on mount
  useEffect(() => {
    SoundManager.load();
    return () => {
      SoundManager.unload();
    };
  }, []);

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
          animateScore();
          SoundManager.playScore();

          // Dynamic difficulty: increase speed every SCORE_INTERVAL points
          if (newScore % SCORE_INTERVAL === 0 && entitiesRef.current) {
            const currentSpeed = entitiesRef.current.pipeSpeed || PIPE_SPEED;
            entitiesRef.current.pipeSpeed = currentSpeed - SPEED_INCREMENT;
          }

          return newScore;
        });
      } else if (e.type === 'game-over') {
        if (gameState === GAME_STATE.RUNNING) {
          setGameState(GAME_STATE.OVER);
          setScore((prev) => {
            setBestScore((best) => Math.max(best, prev));
            return prev;
          });
          showGameOver();
          SoundManager.playDie();
          if (engineRef.current) {
            engineRef.current.stop();
          }
        }
      }
    },
    [gameState]
  );

  const startGame = () => {
    const entities = setupEntities();
    entitiesRef.current = entities;
    setScore(0);
    setGameState(GAME_STATE.RUNNING);

    if (engineRef.current) {
      engineRef.current.swap(entities);
      engineRef.current.start();
    }
  };

  const restart = () => {
    startGame();
  };

  const renderIdleScreen = () => (
    <View style={styles.overlay}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>DERPY DISK</Text>
        <Text style={styles.titleSub}>Floppy Flyer</Text>
      </View>

      {/* Animated bird icon */}
      <View style={styles.idleBirdContainer}>
        <View style={styles.idleBird}>
          <View style={styles.idleBirdHighlight} />
          <View style={styles.idleEye}>
            <View style={styles.idlePupil} />
          </View>
          <View style={styles.idleBeak} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={startGame}
        activeOpacity={0.8}
      >
        <Text style={styles.playButtonText}>▶  TAP TO PLAY</Text>
      </TouchableOpacity>

      {bestScore > 0 && (
        <Text style={styles.bestScoreIdle}>Best: {bestScore}</Text>
      )}

      <Text style={styles.instructions}>Tap anywhere to flap!</Text>
    </View>
  );

  const renderGameOverScreen = () => (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View
        style={[
          styles.gameOverCard,
          { transform: [{ translateY: gameOverSlide }] },
        ]}
      >
        <Text style={styles.gameOverTitle}>GAME OVER</Text>

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

        {score === Math.max(bestScore, score) && score > 0 && (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>🏆 NEW BEST!</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.restartButton}
          onPress={restart}
          activeOpacity={0.8}
        >
          <Text style={styles.restartButtonText}>↻  PLAY AGAIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Parallax background */}
      <View pointerEvents="none" style={styles.engine}>
        <Background />
      </View>

      {/* Game engine */}
      <GameEngine
        ref={engineRef}
        style={styles.engine}
        systems={systems}
        entities={entitiesRef.current || setupEntities()}
        running={gameState === GAME_STATE.RUNNING}
        onEvent={onEvent}
      />

      {/* Score display (during gameplay) */}
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

      {/* Idle / Start screen */}
      {gameState === GAME_STATE.IDLE && renderIdleScreen()}

      {/* Game Over screen */}
      {gameState === GAME_STATE.OVER && renderGameOverScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sky,
  },
  engine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // ─── Score ───
  scoreContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.scoreText,
    textShadowColor: COLORS.scoreStroke,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  // ─── Overlay (shared) ───
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.gameOverBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  // ─── Idle / Title Screen ───
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleMain: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.titleText,
    textShadowColor: COLORS.titleStroke,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 3,
  },
  titleSub: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.scoreText,
    marginTop: 4,
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  idleBirdContainer: {
    marginBottom: 40,
  },
  idleBird: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bird,
    borderWidth: 3,
    borderColor: COLORS.birdInner,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  idleBirdHighlight: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 28,
    height: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  idleEye: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  idlePupil: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C2C2C',
    marginLeft: 2,
  },
  idleBeak: {
    position: 'absolute',
    right: -14,
    top: 32,
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: COLORS.birdBeak,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  playButton: {
    backgroundColor: COLORS.buttonBg,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.buttonShadow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.buttonText,
    letterSpacing: 2,
  },
  bestScoreIdle: {
    marginTop: 20,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  instructions: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  // ─── Game Over ───
  gameOverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Glassmorphism-lite
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.gameOverText,
    letterSpacing: 4,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreRow: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.scoreText,
  },
  scoreValueBest: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.titleText,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  newBestBadge: {
    backgroundColor: COLORS.titleText,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  newBestText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
  },
  restartButton: {
    backgroundColor: COLORS.buttonBg,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.buttonShadow,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  restartButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.buttonText,
    letterSpacing: 2,
  },
});
