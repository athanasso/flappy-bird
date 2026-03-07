import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LEVELS } from '../game/data/levels';
import StorageService from '../game/services/StorageService';

const { width: W } = Dimensions.get('window');

export default function LevelSelect() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelBests, setLevelBests] = useState({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await StorageService.load();
    setUnlockedLevel(data.unlockedLevel);
    setLevelBests(data.levelBestScores || {});
  };

  const getStars = (levelId, best) => {
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level || !level.goalScore || !best) return 0;
    if (best >= level.goalScore * 2) return 3;
    if (best >= level.goalScore * 1.5) return 2;
    if (best >= level.goalScore) return 1;
    return 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT LEVEL</Text>
        <View style={styles.backButton} />
      </View>

      {/* Level grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((level) => {
          const locked = level.id > unlockedLevel;
          const best = levelBests[String(level.id)] || 0;
          const stars = getStars(level.id, best);
          const completed = level.goalScore ? best >= level.goalScore : false;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                {
                  backgroundColor: locked
                    ? 'rgba(255,255,255,0.08)'
                    : level.theme.sky,
                  borderColor: locked
                    ? 'rgba(255,255,255,0.1)'
                    : level.theme.skyTop,
                  opacity: locked ? 0.5 : 1,
                },
              ]}
              onPress={() => {
                if (!locked) {
                  router.push(`/game?level=${level.id}`);
                }
              }}
              activeOpacity={locked ? 1 : 0.7}
              disabled={locked}
            >
              {/* Level number badge */}
              <View
                style={[
                  styles.levelBadge,
                  {
                    backgroundColor: locked
                      ? '#555'
                      : completed
                      ? '#FFD700'
                      : level.theme.pipes,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.levelBadgeText,
                    { color: completed ? '#333' : '#FFF' },
                  ]}
                >
                  {locked ? '🔒' : level.id}
                </Text>
              </View>

              {/* Level info */}
              <View style={styles.levelInfo}>
                <Text style={styles.levelIcon}>{level.icon}</Text>
                <Text
                  style={[
                    styles.levelName,
                    { color: locked ? '#888' : '#FFF' },
                  ]}
                >
                  {level.name}
                </Text>
                <Text
                  style={[
                    styles.levelDesc,
                    { color: locked ? '#666' : 'rgba(255,255,255,0.7)' },
                  ]}
                >
                  {locked ? 'Complete previous level' : level.description}
                </Text>

                {/* Stars */}
                {!locked && (
                  <View style={styles.starsRow}>
                    {[1, 2, 3].map((s) => (
                      <Text
                        key={s}
                        style={[
                          styles.star,
                          { opacity: s <= stars ? 1 : 0.25 },
                        ]}
                      >
                        ⭐
                      </Text>
                    ))}
                  </View>
                )}

                {/* Goal / Best score */}
                {!locked && (
                  <View style={styles.scoreRow}>
                    {level.goalScore && (
                      <Text style={styles.goalText}>
                        Goal: {level.goalScore}
                      </Text>
                    )}
                    {best > 0 && (
                      <Text style={styles.bestText}>Best: {best}</Text>
                    )}
                  </View>
                )}

                {/* Specials */}
                {!locked && level.specials.length > 0 && (
                  <View style={styles.specialsRow}>
                    {level.specials.map((s) => (
                      <View key={s} style={styles.specialBadge}>
                        <Text style={styles.specialText}>
                          {s === 'moving_pipes'
                            ? '↕️ Moving'
                            : s === 'speed_bursts'
                            ? '💨 Bursts'
                            : s === 'narrow_pipes'
                            ? '📏 Narrow'
                            : s === 'low_gravity'
                            ? '🪶 Floaty'
                            : s}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: '#1A2A3A',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#2A3A4A',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
  },
  // Grid
  grid: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 14,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelBadgeText: {
    fontSize: 20,
    fontWeight: '900',
  },
  levelInfo: {
    flex: 1,
  },
  levelIcon: {
    fontSize: 18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  levelDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  star: {
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goalText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  bestText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '700',
  },
  specialsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  specialBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
});
