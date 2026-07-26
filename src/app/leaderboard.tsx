import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useRecordActivity } from '@/hooks/useApiQueries';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

const PLACEHOLDER_RANKS = [
  { rank: 1, name: 'CyberFox', xp: 1240, avatar: '🦊' },
  { rank: 2, name: 'PixelCat', xp: 1180, avatar: '🐱' },
  { rank: 3, name: 'ByteDog', xp: 1050, avatar: '🐶' },
  { rank: 4, name: 'SecureLion', xp: 980, avatar: '🦁' },
  { rank: 5, name: 'SafePanda', xp: 920, avatar: '🐼' },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/(tabs)');
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const recordActivity = useRecordActivity();
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current && user) {
      viewedRef.current = true;
      recordActivity.mutate('leaderboard_view');
    }
  }, [user, recordActivity]);

  if (!user) {
    router.replace('/');
    return null;
  }

  if (ageGroup === 'A') {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.lockedEmoji}>🔒</Text>
          <Text style={styles.lockedTitle}>Leaderboard locked</Text>
          <Text style={styles.lockedSub}>
            The leaderboard is available for Group B heroes only.
          </Text>
          <Button label="Go back" variant="secondary" onPress={safeBack} style={styles.backBtn} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top cyber heroes this week</Text>
      </View>

      <View style={styles.podium}>
        {PLACEHOLDER_RANKS.slice(0, 3).map((r, i) => (
          <View
            key={r.rank}
            style={[
              styles.podiumCard,
              i === 0 && styles.podiumFirst,
            ]}
          >
            <Text style={styles.podiumEmoji}>{r.avatar}</Text>
            <Text style={styles.podiumName}>{r.name}</Text>
            <Text style={styles.podiumXp}>{r.xp} XP</Text>
            <Text style={styles.podiumRank}>#{r.rank}</Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {PLACEHOLDER_RANKS.map((r) => (
          <View key={r.rank} style={styles.row}>
            <Text style={styles.rowRank}>#{r.rank}</Text>
            <Text style={styles.rowEmoji}>{r.avatar}</Text>
            <Text style={styles.rowName}>{r.name}</Text>
            <Text style={styles.rowXp}>{r.xp} XP</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footnote}>Placeholder data — connect to backend for live rankings.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  lockedEmoji: { fontSize: 64 },
  lockedTitle: { fontSize: 24, fontWeight: '900', color: '#1c2742' },
  lockedSub: { fontSize: 15, color: '#5b6478', textAlign: 'center', paddingHorizontal: Spacing.four },
  backBtn: { marginTop: Spacing.three },
  header: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478' },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  podiumCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#e2e8f4',
    paddingBottom: Spacing.three,
  },
  podiumFirst: {
    borderColor: Brand.warning,
    backgroundColor: '#fffdf3',
  },
  podiumEmoji: { fontSize: 36 },
  podiumName: { fontSize: 14, fontWeight: '800', color: '#1c2742' },
  podiumXp: { fontSize: 12, fontWeight: '700', color: '#5b6478' },
  podiumRank: { fontSize: 12, fontWeight: '900', color: Brand.primary },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  rowRank: { fontSize: 14, fontWeight: '900', color: '#7c869c', width: 32 },
  rowEmoji: { fontSize: 24 },
  rowName: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1c2742' },
  rowXp: { fontSize: 14, fontWeight: '900', color: Brand.success },
  footnote: {
    textAlign: 'center',
    color: '#9aa3b5',
    fontSize: 12,
    marginTop: Spacing.four,
  },
});
