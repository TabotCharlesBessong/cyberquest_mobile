import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';
import { useCurrentUser, useGems } from '@/hooks/useAuth';
import { useShopItems, usePurchaseItem, useRecordActivity } from '@/hooks/useApiQueries';
import { ShopItemCard } from '@/components/ShopItemCard';
import { StatsCard } from '@/components/StatsCard';

type Category = 'all' | 'avatar' | 'powerup' | 'consumable';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'avatar', label: 'Avatars' },
  { key: 'powerup', label: 'Power-ups' },
  { key: 'consumable', label: 'Consumables' },
];

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const gems = useGems();
  const shopQuery = useShopItems();
  const purchaseMutation = usePurchaseItem();
  const recordActivity = useRecordActivity();
  const [category, setCategory] = useState<Category>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const visitedRef = useRef(false);

  useEffect(() => {
    if (!visitedRef.current && user) {
      visitedRef.current = true;
      recordActivity.mutate('shop_visit');
    }
  }, [user, recordActivity]);

  const items = (shopQuery.data?.data as { items: unknown[] } | undefined)?.items ?? [];
  const filtered = category === 'all' ? items : items.filter((i: any) => i.type === category);

  async function handlePurchase(item: { id: string; name: string; cost: number }) {
    setPurchasingId(item.id);
    try {
      await purchaseMutation.mutateAsync(item.id);
      recordActivity.mutate('purchase');
      alert(`${item.name} purchased!`);
    } catch (e) {
      alert((e as Error)?.message || 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  }

  if (!user) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.loadingText}>Please log in to visit the shop.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
      refreshControl={
        <RefreshControl refreshing={shopQuery.isFetching} onRefresh={shopQuery.refetch} tintColor={Brand.primary} />
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

      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            style={[styles.categoryBtn, category === cat.key && styles.categoryBtnActive]}
          >
            <Text style={[styles.categoryText, category === cat.key && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {shopQuery.isLoading ? (
        <Text style={styles.loadingText}>Loading shop...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No items available in this category.</Text>
      ) : (
        <View style={styles.list}>
          {(filtered as any[]).map((item) => (
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
  loadingText: { fontSize: 16, fontWeight: '700', color: '#7c869c', textAlign: 'center', marginTop: Spacing.four },
  emptyText: { fontSize: 14, fontWeight: '600', color: '#7c869c', textAlign: 'center', marginTop: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
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
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  categoryBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  categoryBtnActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7c869c',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
});
