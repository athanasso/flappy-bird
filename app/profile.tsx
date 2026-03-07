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
import { ACHIEVEMENTS } from '../game/data/achievements';
import StorageService from '../game/services/StorageService';

const { width: W } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const d = await StorageService.load();
    setData(d);
  };

  if (!data) return null;

  const unlockedCount = data.achievements?.length || 0;
  const totalCount = ACHIEVEMENTS.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

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
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.totalGames}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>
              {data.coins}
            </Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {unlockedCount} / {totalCount} Achievements
            </Text>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct}%` },
              ]}
            />
          </View>
        </View>

        {/* Achievement list */}
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = data.achievements?.includes(achievement.id);

          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                {
                  opacity: unlocked ? 1 : 0.45,
                  borderColor: unlocked
                    ? '#FFD700'
                    : 'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <View
                style={[
                  styles.achievementIcon,
                  {
                    backgroundColor: unlocked
                      ? 'rgba(255,215,0,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  },
                ]}
              >
                <Text style={styles.achievementEmoji}>
                  {unlocked ? achievement.icon : '🔒'}
                </Text>
              </View>

              <View style={styles.achievementInfo}>
                <Text
                  style={[
                    styles.achievementName,
                    { color: unlocked ? '#FFF' : '#888' },
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    {
                      color: unlocked
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(255,255,255,0.3)',
                    },
                  ]}
                >
                  {achievement.description}
                </Text>
              </View>

              {unlocked && (
                <Text style={styles.checkmark}>✅</Text>
              )}
            </View>
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
    backgroundColor: '#2A1A3A',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#3A2A4A',
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
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },
  // Progress
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  // Achievement cards
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
  },
});
