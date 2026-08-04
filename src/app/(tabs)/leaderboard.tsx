import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useRecordActivity, useLeaderboard } from '@/hooks/useApiQueries';
import { Primary, Secondary, Tertiary, Brand, Spacing } from '@/constants/theme';

type Scope = 'global' | 'class' | 'school';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'class', label: 'Class' },
  { key: 'school', label: 'School' },
];

const MOCK_ENTRIES = [
  { userId: '1', name: 'ShadowByte', avatar: '👑', xp: 3120, level: 15, trend: 'up' as const },
  { userId: '2', name: 'Zoe.Net', avatar: '🔮', xp: 2840, level: 14, trend: 'up' as const },
  { userId: '3', name: 'PixelPioneer', avatar: '🎮', xp: 2610, level: 13, trend: 'down' as const },
  { userId: 'me', name: 'You', avatar: '🦸', xp: 2450, level: 14, trend: 'down' as const, isMe: true },
  { userId: '5', name: 'DataDiva', avatar: '📊', xp: 2200, level: 12, trend: 'up' as const },
  { userId: '6', name: 'CodeCracker', avatar: '💻', xp: 2150, level: 11, trend: null },
  { userId: '7', name: 'LinkLeaper', avatar: '🦘', xp: 1980, level: 10, trend: 'up' as const },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const recordActivity = useRecordActivity();
  const viewedRef = useRef(false);
  const [scope, setScope] = useState<Scope>('global');

  const leaderboardQuery = useLeaderboard(scope);
  const rawEntries = (leaderboardQuery.data?.data as { entries: any[] } | undefined)?.entries ?? [];
  const entries = rawEntries.length > 0 ? rawEntries : MOCK_ENTRIES;

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
          styles.content,
          { paddingTop: insets.top + Spacing.three },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.lockedEmoji}>🔒</Text>
          <Text style={styles.lockedTitle}>Leaderboard locked</Text>
          <Text style={styles.lockedSub}>
            The leaderboard is available for Group B heroes only.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const myRank = entries.find((e: any) => e.userId === 'me' || e.isMe);
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <View style={[styles.flex, { backgroundColor: Brand.surface }]}>
      <View style={[styles.orbContainer, { paddingTop: insets.top }]}>
        <View style={[styles.orb, styles.orbPrimary]} />
        <View style={[styles.orb, styles.orbSecondary]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Global Rank</Text>
            <Text style={styles.subtitle}>Week 12 • Cyber Defense League</Text>
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
        </View>

        <View style={styles.podium}>
          {podiumOrder.map((entry, idx) => {
            const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const heights = [140, 180, 120];
            const isTop = rank === 1;
            const avatarSize = isTop ? 72 : 56;
            const borderColors = ['#C1C6D5', Tertiary.tertiaryFixedDim, '#CD7F32'];
            const badgeColors = ['#727784', Tertiary.tertiaryFixedDim, '#CD7F32'];
            const xpColors = [Primary.primary, '#3D2D00', Primary.primary];

            return (
              <View key={entry.userId} style={[styles.podiumCol, isTop && styles.podiumColTop]}>
                <View style={styles.podiumAvatarWrap}>
                  <View
                    style={[
                      styles.podiumAvatar,
                      {
                        width: avatarSize,
                        height: avatarSize,
                        borderColor: borderColors[rank - 1],
                      },
                    ]}
                  >
                    <Text style={styles.podiumAvatarEmoji}>{entry.avatar}</Text>
                  </View>
                  <View style={[styles.podiumBadge, { backgroundColor: badgeColors[rank - 1] }]}>
                    <Text style={styles.podiumBadgeText}>
                      {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
                    </Text>
                  </View>
                  {isTop && <Text style={styles.podiumStar}>⭐</Text>}
                </View>
                <View style={[styles.podiumBar, { height: heights[rank - 1] }]}>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={[styles.podiumXp, { color: xpColors[rank - 1] }]}>
                    {entry.xp.toLocaleString()} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {myRank && (
          <View style={styles.myRankCard}>
            <View style={styles.myRankLeft}>
              <View style={styles.myRankPos}>
                <Text style={styles.myRankNum}>#{myRank.rank}</Text>
                {myRank.trend === 'up' && <Text style={[styles.trendIcon, { color: Brand.success }]}>▲</Text>}
                {myRank.trend === 'down' && <Text style={[styles.trendIcon, { color: Brand.danger }]}>▼</Text>}
                {!myRank.trend && <Text style={styles.trendIcon}>—</Text>}
              </View>
              <View style={styles.myRankAvatar}>
                <Text style={styles.myRankAvatarEmoji}>{myRank.avatar}</Text>
              </View>
              <View style={styles.myRankInfo}>
                <View style={styles.myRankNameRow}>
                  <Text style={styles.myRankName}>You</Text>
                  <View style={styles.masterBadge}>
                    <Text style={styles.masterBadgeText}>Master</Text>
                  </View>
                </View>
                <Text style={styles.myRankLevel}>Lv. {myRank.level} Defender</Text>
              </View>
            </View>
            <View style={styles.myRankRight}>
              <Text style={styles.myRankXp}>{myRank.xp.toLocaleString()}</Text>
              <Text style={styles.myRankXpLabel}>XP</Text>
            </View>
          </View>
        )}

        <View style={styles.list}>
          {rest.length === 0 ? (
            <Text style={styles.emptyText}>No rankings yet. Keep playing to climb the board!</Text>
          ) : (
            rest.map((r: any, i: number) => (
              <View key={r.userId} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowRank}>#{i + 4}</Text>
                  <View style={styles.rowTrend}>
                    {r.trend === 'up' && <Text style={[styles.trendIcon, { color: Brand.success }]}>▲</Text>}
                    {r.trend === 'down' && <Text style={[styles.trendIcon, { color: Brand.danger }]}>▼</Text>}
                    {!r.trend && <Text style={styles.trendIcon}>—</Text>}
                  </View>
                </View>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarEmoji}>{r.avatar}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{r.name}</Text>
                  <Text style={styles.rowLevel}>Lv. {r.level} {r.title}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowXp}>{r.xp.toLocaleString()}</Text>
                  <Text style={styles.rowXpLabel}>XP</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  orbContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 9999,
  },
  orbPrimary: {
    top: -100,
    left: -100,
    backgroundColor: Primary.primaryContainer,
    opacity: 0.3,
  },
  orbSecondary: {
    bottom: -100,
    right: -100,
    backgroundColor: Secondary.secondaryContainer,
    opacity: 0.3,
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  title: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 28,
    fontWeight: '800',
    color: '#1c2742',
    letterSpacing: -0.02,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '500',
    color: '#414753',
  },
  scopeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(240,244,251,0.8)',
    borderRadius: 9999,
    padding: 4,
  },
  scopeBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
  },
  scopeBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scopeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#414753',
    letterSpacing: 0.05,
  },
  scopeTextActive: {
    color: Primary.primary,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 280,
    marginBottom: Spacing.four,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  podiumColTop: {
    transform: [{ scale: 1.05 }],
  },
  podiumAvatarWrap: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  podiumAvatar: {
    borderRadius: 9999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  podiumAvatarEmoji: {
    fontSize: 28,
  },
  podiumBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  podiumBadgeText: {
    fontFamily: 'Inter_900Black',
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.05,
  },
  podiumStar: {
    fontSize: 20,
    marginTop: -8,
  },
  podiumBar: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.3)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  podiumName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1c2742',
    letterSpacing: 0.05,
  },
  podiumXp: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 14,
    fontWeight: '800',
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Primary.primary,
    borderRadius: 20,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: Primary.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  myRankPos: {
    alignItems: 'center',
    gap: 2,
    width: 40,
  },
  myRankNum: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: '900',
  },
  myRankAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  myRankAvatarEmoji: {
    fontSize: 24,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  myRankName: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  masterBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  masterBadgeText: {
    fontFamily: 'Inter_900Black',
    fontSize: 10,
    fontWeight: '900',
    color: Primary.primary,
    letterSpacing: 0.1,
  },
  myRankLevel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  myRankRight: {
    alignItems: 'flex-end',
  },
  myRankXp: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  myRankXpLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.05,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.3)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  rowLeft: {
    width: 32,
    alignItems: 'center',
  },
  rowRank: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 14,
    fontWeight: '800',
    color: '#727784',
  },
  rowTrend: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIconSmall: {
    fontSize: 12,
    fontWeight: '900',
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.3)',
  },
  rowAvatarEmoji: {
    fontSize: 20,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#1c2742',
  },
  rowLevel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#727784',
    marginTop: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowXp: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: Primary.primary,
    lineHeight: 20,
  },
  rowXpLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9aa3b5',
    fontSize: 14,
    marginTop: Spacing.four,
  },
  lockedEmoji: { fontSize: 64 },
  lockedTitle: { fontSize: 24, fontWeight: '900', color: '#1c2742', marginTop: Spacing.three },
  lockedSub: { fontSize: 15, color: '#5b6478', textAlign: 'center', paddingHorizontal: Spacing.four },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
});
