import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useMyLeague, useRecordActivity } from '@/hooks/useApiQueries';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

const TIERS: Record<string, { label: string; color: string; emoji: string }> = {
  bronze: { label: 'Bronze', color: '#cd7f32', emoji: '🥉' },
  silver: { label: 'Silver', color: '#c0c0c0', emoji: '🥈' },
  gold: { label: 'Gold', color: '#ffd700', emoji: '🥇' },
  diamond: { label: 'Diamond', color: '#b9f2ff', emoji: '💎' },
};

export default function LeagueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/(tabs)');
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const recordActivity = useRecordActivity();
  const viewedRef = useRef(false);

  const leagueQuery = useMyLeague();
  const leagueData = leagueQuery.data?.data as { league: any; standings: any[] } | undefined;

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
          <Text style={styles.lockedTitle}>Leagues locked</Text>
          <Text style={styles.lockedSub}>
            Leagues are available for Group B heroes only.
          </Text>
          <Button label="Go back" variant="secondary" onPress={safeBack} style={styles.backBtn} />
        </View>
      </ScrollView>
    );
  }

  if (leagueQuery.isLoading) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.loadingText}>Loading league...</Text>
      </View>
    );
  }

  const league = leagueData?.league;
  const standings = leagueData?.standings ?? [];

  if (!league) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.lockedEmoji}>🏆</Text>
          <Text style={styles.lockedTitle}>No league yet</Text>
          <Text style={styles.lockedSub}>
            Keep playing to earn XP and join a league.
          </Text>
          <Button label="Go back" variant="secondary" onPress={safeBack} style={styles.backBtn} />
        </View>
      </ScrollView>
    );
  }

  const tierInfo = TIERS[league.tier] || TIERS.bronze;
  const myStanding = standings.find((s) => s.userId === user.id);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>League</Text>
        <Text style={styles.subtitle}>Weekly competition</Text>
      </View>

      <View style={[styles.leagueCard, { borderColor: tierInfo.color }]}>
        <Text style={styles.leagueEmoji}>{tierInfo.emoji}</Text>
        <Text style={[styles.leagueTier, { color: tierInfo.color }]}>{tierInfo.label}</Text>
        {league.changeNote && (
          <Text style={styles.changeNote}>{league.changeNote}</Text>
        )}
        <View style={styles.leagueStats}>
          <View style={styles.leagueStat}>
            <Text style={styles.leagueStatValue}>{league.xp}</Text>
            <Text style={styles.leagueStatLabel}>Your XP</Text>
          </View>
          <View style={styles.leagueStat}>
            <Text style={styles.leagueStatValue}>#{myStanding?.rank ?? '-'}</Text>
            <Text style={styles.leagueStatLabel}>Rank</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Standings</Text>
      <View style={styles.list}>
        {standings.length === 0 ? (
          <Text style={styles.emptyText}>No standings yet.</Text>
        ) : (
          standings.slice(0, 20).map((s, i) => (
            <View
              key={s.userId}
              style={[
                styles.row,
                s.userId === user.id && styles.rowMe,
              ]}
            >
              <Text style={[styles.rowRank, i < 3 && styles.rowRankTop]}>#{i + 1}</Text>
              <Text style={styles.rowEmoji}>{s.avatar}</Text>
              <Text style={styles.rowName}>{s.name}</Text>
              <Text style={styles.rowXp}>{s.xp} XP</Text>
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
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#7c869c' },
  lockedEmoji: { fontSize: 64 },
  lockedTitle: { fontSize: 24, fontWeight: '900', color: '#1c2742' },
  lockedSub: { fontSize: 15, color: '#5b6478', textAlign: 'center', paddingHorizontal: Spacing.four },
  backBtn: { marginTop: Spacing.three },
  header: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478' },
  leagueCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.five,
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: Spacing.four,
  },
  leagueEmoji: { fontSize: 48 },
  leagueTier: { fontSize: 24, fontWeight: '900', marginTop: Spacing.two },
  changeNote: { fontSize: 14, fontWeight: '700', color: Brand.primary, marginTop: Spacing.two },
  leagueStats: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  leagueStat: { alignItems: 'center' },
  leagueStatValue: { fontSize: 22, fontWeight: '900', color: '#1c2742' },
  leagueStatLabel: { fontSize: 12, fontWeight: '700', color: '#5b6478' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginBottom: Spacing.two,
  },
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
