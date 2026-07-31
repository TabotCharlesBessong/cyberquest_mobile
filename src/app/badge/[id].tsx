import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function BadgeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => api.gamification.getBadges(),
    staleTime: 1000 * 60 * 5,
  });

  const badges = (query.data?.data as { badges: unknown[] } | undefined)?.badges ?? [];
  const badge = badges.find((b: any) => b.id === id);

  if (query.isLoading) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.loadingText}>Loading badge...</Text>
      </View>
    );
  }

  if (!badge) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.errorText}>Badge not found.</Text>
      </View>
    );
  }

  const badgeData = badge as {
    icon: string;
    name: string;
    rarity: string;
    description: string;
    xpReward: number;
    gemsReward: number;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>{badgeData.icon}</Text>
        <Text style={styles.name}>{badgeData.name}</Text>
        <Text style={styles.rarity}>{badgeData.rarity}</Text>
        <Text style={styles.description}>{badgeData.description}</Text>

        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>XP Reward</Text>
          <Text style={styles.rewardValue}>⭐ {badgeData.xpReward}</Text>
        </View>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>Gems Reward</Text>
          <Text style={styles.rewardValue}>💎 {badgeData.gemsReward}</Text>
        </View>
      </View>
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
  errorText: { fontSize: 16, fontWeight: '700', color: Brand.danger, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: Brand.shadow,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  emoji: { fontSize: 72 },
  name: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  rarity: { fontSize: 14, fontWeight: '800', color: Brand.primary, textTransform: 'uppercase' },
  description: { fontSize: 16, fontWeight: '600', color: '#3a4560', textAlign: 'center', marginTop: Spacing.two },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f4',
  },
  rewardLabel: { fontSize: 15, fontWeight: '700', color: '#7c869c' },
  rewardValue: { fontSize: 15, fontWeight: '900', color: '#1c2742' },
});
