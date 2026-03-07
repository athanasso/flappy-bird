import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../game/constants';
import StorageService from '../game/services/StorageService';

const { width: W, height: H } = Dimensions.get('window');

export default function MainMenu() {
  const router = useRouter();
  const [bestScore, setBestScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [coins, setCoins] = useState(0);

  // Animations
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const birdBounce = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(60)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    animateEntrance();
  }, []);

  const loadData = async () => {
    const data = await StorageService.load();
    setBestScore(data.bestScore);
    setTotalGames(data.totalGames);
    setCoins(data.coins);
  };

  const animateEntrance = () => {
    // Title zoom in
    Animated.parallel([
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Bird bounce loop
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(birdBounce, {
          toValue: -12,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(birdBounce, {
          toValue: 12,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    bounceLoop.start();

    // Buttons slide up
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(buttonsSlide, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Coins display */}
      <View style={styles.coinsContainer}>
        <Text style={styles.coinsText}>🪙 {coins}</Text>
      </View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            transform: [{ scale: titleScale }],
            opacity: titleOpacity,
          },
        ]}
      >
        <Text style={styles.titleMain}>DERPY DISK</Text>
        <Text style={styles.titleSub}>FLOPPY FLYER</Text>
      </Animated.View>

      {/* Bird mascot */}
      <Animated.View
        style={[
          styles.birdContainer,
          { transform: [{ translateY: birdBounce }] },
        ]}
      >
        <View style={styles.bird}>
          <View style={styles.birdHighlight} />
          <View style={styles.birdEye}>
            <View style={styles.birdPupil} />
          </View>
          <View style={styles.birdBeak} />
          <View style={styles.birdWing} />
        </View>
      </Animated.View>

      {/* Menu buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            transform: [{ translateY: buttonsSlide }],
            opacity: buttonsOpacity,
          },
        ]}
      >
        {/* Quick Play */}
        <TouchableOpacity
          style={[styles.menuButton, styles.playButton]}
          onPress={() => router.push('/game?level=1')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonIcon}>▶</Text>
          <Text style={styles.menuButtonText}>QUICK PLAY</Text>
        </TouchableOpacity>

        {/* Levels */}
        <TouchableOpacity
          style={[styles.menuButton, styles.levelsButton]}
          onPress={() => router.push('/levels')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonIcon}>🗺️</Text>
          <Text style={styles.menuButtonText}>LEVELS</Text>
        </TouchableOpacity>

        {/* Profile / Achievements */}
        <TouchableOpacity
          style={[styles.menuButton, styles.profileButton]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonIcon}>🏆</Text>
          <Text style={styles.menuButtonText}>ACHIEVEMENTS</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        {bestScore > 0 && (
          <Text style={styles.statsText}>
            Best: {bestScore}  •  Games: {totalGames}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: '#2B8A94',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#4EC0CA',
  },
  // Coins
  coinsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleMain: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.titleText,
    textShadowColor: COLORS.titleStroke,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  titleSub: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 8,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Bird
  birdContainer: {
    marginVertical: 24,
  },
  bird: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.bird,
    borderWidth: 3,
    borderColor: COLORS.birdInner,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  birdHighlight: {
    position: 'absolute',
    top: 10,
    left: 14,
    width: 30,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  birdEye: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CCC',
  },
  birdPupil: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2C2C2C',
    marginLeft: 3,
    marginTop: 1,
  },
  birdBeak: {
    position: 'absolute',
    right: -16,
    top: 36,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: COLORS.birdBeak,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  birdWing: {
    position: 'absolute',
    left: -4,
    top: 42,
    width: 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.birdInner,
    borderWidth: 1,
    borderColor: '#C68A12',
  },
  // Buttons
  buttonsContainer: {
    width: W * 0.75,
    gap: 14,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    gap: 10,
  },
  playButton: {
    backgroundColor: '#5BB33B',
    borderColor: '#3D8B2D',
  },
  levelsButton: {
    backgroundColor: '#3A8FD6',
    borderColor: '#2A6FAA',
  },
  profileButton: {
    backgroundColor: '#D4A017',
    borderColor: '#A07A10',
  },
  menuButtonIcon: {
    fontSize: 22,
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  // Stats
  statsBar: {
    position: 'absolute',
    bottom: 40,
  },
  statsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
});
