import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useRecordActivity, useLeaderboard } from '@/hooks/useApiQueries';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

type Scope = 'global' | 'class' | 'school';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'class', label: 'Class' },
  { key: 'school', label: 'School' },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/(tabs)');
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const recordActivity = useRecordActivity();
  const viewedRef = useRef(false);
  const [scope, setScope] = useState<Scope>('global');

  const leaderboardQuery = useLeaderboard(scope);
  const rawEntries = (leaderboardQuery.data?.data as { entries: any[] } | undefined)?.entries ?? [];
  const entries = rawEntries;

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

  const myRank = entries.find((e: any) => e.userId === user.id);

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

      <View style={styles.scopeRow}>
        {SCOPES.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.scopeBtn, scope === s.key && styles.scopeBtnActive]}
            onPress={() => setScope(s.key)}
          >
            <Text style={[styles.scopeText, scope === s.key && styles.scopeTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your rank</Text>
          <Text style={styles.myRankValue}>#{myRank.rank}</Text>
          <Text style={styles.myRankXp}>{myRank.score} XP</Text>
        </View>
      )}

      <View style={styles.list}>
        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No rankings yet. Keep playing to climb the board!</Text>
        ) : (
          entries.slice(0, 50).map((r: any, i: number) => (
            <View
              key={r.userId}
              style={[
                styles.row,
                r.userId === user.id && styles.rowMe,
              ]}
            >
              <Text style={[styles.rowRank, i < 3 && styles.rowRankTop]}>#{i + 1}</Text>
              <Text style={styles.rowEmoji}>{r.avatar}</Text>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowXp}>{r.score} XP</Text>
            </View>
          ))
        )}
      </View>
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
  scopeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  scopeBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  scopeBtnActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  scopeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7c869c',
  },
  scopeTextActive: {
    color: '#fff',
  },
  myRankCard: {
    backgroundColor: Brand.primary,
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  myRankLabel: { fontSize: 13, fontWeight: '700', color: '#fff', opacity: 0.9 },
  myRankValue: { fontSize: 32, fontWeight: '900', color: '#fff' },
  myRankXp: { fontSize: 14, fontWeight: '800', color: '#fff', opacity: 0.9 },
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
  rowMe: {
    borderColor: Brand.primary,
    backgroundColor: '#f0f4ff',
  },
  rowRank: { fontSize: 14, fontWeight: '900', color: '#7c869c', width: 32 },
  rowRankTop: { color: Brand.warning },
  rowEmoji: { fontSize: 24 },
  rowName: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1c2742' },
  rowXp: { fontSize: 14, fontWeight: '900', color: Brand.success },
  emptyText: {
    textAlign: 'center',
    color: '#9aa3b5',
    fontSize: 14,
    marginTop: Spacing.four,
  },
});
