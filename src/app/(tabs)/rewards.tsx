import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';
import { useCurrentUser, useGems } from '@/hooks/useAuth';
import { useBadges, useShopItems, usePurchaseItem } from '@/hooks/useApiQueries';
import { BadgeCard } from '@/components/BadgeCard';
import { ShopItemCard } from '@/components/ShopItemCard';
import { StatsCard } from '@/components/StatsCard';

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const gems = useGems();
  const badgesQuery = useBadges();
  const shopQuery = useShopItems();
  const purchaseMutation = usePurchaseItem();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const badges = (badgesQuery.data?.data as { badges: unknown[] } | undefined)?.badges ?? [];
  const items = (shopQuery.data?.data as { items: unknown[] } | undefined)?.items ?? [];

  if (!user) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.loadingText}>Please log in to view rewards.</Text>
      </View>
    );
  }

  async function handlePurchase(item: { id: string; name: string; cost: number }) {
    setPurchasingId(item.id);
    try {
      await purchaseMutation.mutateAsync(item.id);
      alert(`${item.name} purchased!`);
    } catch (e) {
      alert((e as Error)?.message || 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
      refreshControl={
        <RefreshControl refreshing={shopQuery.isFetching || badgesQuery.isFetching} onRefresh={() => { shopQuery.refetch(); badgesQuery.refetch(); }} tintColor={Brand.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Rewards Shop</Text>
        <View style={styles.gemRow}>
          <Text style={styles.gemEmoji}>💎</Text>
          <Text style={styles.gemValue}>{gems} Gems</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatsCard emoji="⭐" value={`${user.xp}`} label="XP" />
        <StatsCard emoji="🔥" value={`${user.streak}`} label="Streak" />
        <StatsCard emoji="❤️" value={`${user.hearts}`} label="Hearts" />
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      {badgesQuery.isLoading ? (
        <Text style={styles.loadingText}>Loading badges...</Text>
      ) : (
        <View style={styles.badgeRow}>
          {(badges as any[]).map((b) => (
            <BadgeCard
              key={b.id}
              emoji={b.icon}
              name={b.name}
              description={b.description}
              rarity={b.rarity}
              earned={b.earned}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Shop</Text>
      {shopQuery.isLoading ? (
        <Text style={styles.loadingText}>Loading shop...</Text>
      ) : (
        <View style={styles.shopList}>
          {(items as any[]).map((item) => (
            <ShopItemCard
              key={item.id}
              emoji={item.icon}
              name={item.name}
              description={item.description}
              cost={item.cost}
              costType={item.costType}
              rarity={item.rarity}
              onPress={() => handlePurchase(item)}
            />
          ))}
        </View>
      )}

      <Pressable style={styles.shopTabBtn} onPress={() => router.push('/(tabs)/shop')}>
        <Text style={styles.shopTabText}>Browse Full Shop</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#7c869c' },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  gemEmoji: { fontSize: 24 },
  gemValue: { fontSize: 18, fontWeight: '900', color: '#1c2742' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  shopList: { gap: Spacing.two },
  shopTabBtn: {
    marginTop: Spacing.four,
    backgroundColor: Brand.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  shopTabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
