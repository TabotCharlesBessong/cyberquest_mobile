import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { AvatarPreview } from '@/components/AvatarPreview';
import { BadgeCard } from '@/components/BadgeCard';
import { StatsCard } from '@/components/StatsCard';
import { useProfileData } from '@/hooks/useProfileData';
import { useLogout } from '@/hooks/useAuth';
import { useRecordActivity } from '@/hooks/useApiQueries';
import { Brand, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, data, isLoading, error, level, completedBadges, progressQuery } = useProfileData();
  const logout = useLogout();
  const recordActivity = useRecordActivity();
  const profileViewRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.replace('/');
        return;
      }
      if (!profileViewRef.current) {
        profileViewRef.current = true;
        recordActivity.mutate('profile_view');
      }
    }, [user, router, recordActivity])
  );

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  if (isLoading) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.errorText}>{error || 'Not logged in.'}</Text>
        <Pressable onPress={() => progressQuery.refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const p = data?.user ?? user;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
      refreshControl={
        <RefreshControl refreshing={progressQuery.isFetching} onRefresh={progressQuery.refetch} tintColor={Brand.primary} />
      }
    >
      <View style={styles.card}>
        <AvatarPreview emoji={p.avatar || '🦊'} size={100} />
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.age}>Age {p.age} · Group {p.ageGroup ?? 'A'}</Text>

        <View style={styles.statsRow}>
          <StatsCard emoji="⭐" value={`${p.xp}`} label="XP" />
          <StatsCard emoji="🔥" value={`${p.streak}`} label="Streak" />
          <StatsCard emoji="💎" value={`${p.gems}`} label="Gems" accent />
        </View>
        <View style={styles.statsRow}>
          <StatsCard emoji="❤️" value={`${p.hearts}`} label="Hearts" />
          <StatsCard emoji="🏅" value={`${completedBadges}`} label="Badges" />
          <StatsCard emoji="📊" value={`${level}`} label="Level" />
        </View>
      </View>

      <Pressable style={styles.customizeBtn} onPress={() => router.push('/avatar-customizer')}>
        <Text style={styles.customizeText}>🎨 Customize Avatar</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Badges earned</Text>
      {!data || data.badges.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Complete lessons to earn your first badge! 🌟
          </Text>
        </View>
      ) : (
        <View style={styles.badgeGrid}>
          {data.badges.map((b: any) => (
            <BadgeCard
              key={b.id}
              emoji={b.icon}
              name={b.name}
              description={b.description}
              rarity={b.rarity}
              earned={b.earned}
              onPress={() => router.push({ pathname: '/badge/[id]', params: { id: b.id } })}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>World progress</Text>
      <View style={styles.modules}>
        {data?.modules.map((m) => (
          <View key={m.id} style={styles.moduleRow}>
            <View style={[styles.moduleDot, { backgroundColor: m.color }]}>
              <Text style={styles.moduleEmoji}>
                {m.status === 'completed' ? '✓' : m.icon}
              </Text>
            </View>
            <View style={styles.moduleText}>
              <Text style={styles.moduleTitle}>{m.title}</Text>
              <Text style={styles.moduleSub}>
                {m.status === 'completed' ? 'Completed' : m.status === 'in_progress' ? 'In progress' : 'Not started'}
              </Text>
            </View>
            {m.status === 'completed' ? (
              <Text style={styles.moduleCheck}>✓</Text>
            ) : (
              <Text style={styles.moduleLock}>○</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.navRow}>
        <Pressable style={styles.navBtn} onPress={() => router.push('/leaderboard')}>
          <Text style={styles.navBtnText}>🏆 Leaderboard</Text>
        </Pressable>
        <Pressable style={styles.navBtn} onPress={() => router.push('/parent')}>
          <Text style={styles.navBtnText}>👨‍👩‍👧 Parent</Text>
        </Pressable>
      </View>

      <Button
        label="Log out"
        variant="secondary"
        fullWidth
        onPress={handleLogout}
        style={styles.logout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#7c869c' },
  errorText: { fontSize: 16, fontWeight: '700', color: Brand.danger, textAlign: 'center', marginBottom: Spacing.three },
  retryBtn: { backgroundColor: Brand.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.five,
    alignItems: 'center',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  name: { fontSize: 26, fontWeight: '900', color: '#1c2742', marginTop: 8 },
  age: { fontSize: 14, color: '#7c869c', fontWeight: '700', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 84,
  },
  customizeBtn: {
    marginTop: Spacing.three,
    backgroundColor: Brand.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  customizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7c869c',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badgeCell: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
    width: '30%',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  badgeEmoji: { fontSize: 40 },
  badgeName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3a4560',
    marginTop: 4,
    textAlign: 'center',
  },
  modules: { gap: Spacing.two },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  moduleDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleEmoji: { fontSize: 22, color: '#fff', fontWeight: '900' },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 16, fontWeight: '800', color: '#1c2742' },
  moduleSub: { fontSize: 12, color: '#7c869c', fontWeight: '600' },
  moduleCheck: { fontSize: 22, color: Brand.success, fontWeight: '900' },
  moduleLock: { fontSize: 20, color: '#c4ccdb' },
  navRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four },
  navBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  navBtnText: { fontSize: 15, fontWeight: '800', color: Brand.primary },
  logout: { marginTop: Spacing.five },
});
