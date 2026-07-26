import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';
import { useCurrentUser, useGems } from '@/hooks/useAuth';
import { useInventory, useEquipItem } from '@/hooks/useApiQueries';
import { AvatarPreview } from '@/components/AvatarPreview';
import { InventoryItemCard } from '@/components/InventoryItemCard';
import { StatsCard } from '@/components/StatsCard';

type Category = 'all' | 'avatar' | 'powerup' | 'consumable';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'avatar', label: 'Avatars' },
  { key: 'powerup', label: 'Power-ups' },
  { key: 'consumable', label: 'Consumables' },
];

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const gems = useGems();
  const inventoryQuery = useInventory();
  const equipMutation = useEquipItem();
  const [category, setCategory] = useState<Category>('all');

  const inventory = (inventoryQuery.data?.data as { inventory: unknown[] } | undefined)?.inventory ?? [];
  const filtered = category === 'all' ? inventory : inventory.filter((i: any) => i.type === category);

  async function handleEquip(itemId: string) {
    try {
      await equipMutation.mutateAsync(itemId);
      inventoryQuery.refetch();
    } catch (e) {
      alert((e as Error)?.message || 'Failed to equip item');
    }
  }

  if (!user) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.loadingText}>Please log in to view your inventory.</Text>
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
        <RefreshControl refreshing={inventoryQuery.isFetching} onRefresh={inventoryQuery.refetch} tintColor={Brand.primary} />
      }
    >
      <Text style={styles.title}>Inventory</Text>

      <View style={styles.avatarSection}>
        <AvatarPreview emoji={user.avatar || '🦊'} size={100} label={user.name} />
        <View style={styles.statsRow}>
          <StatsCard emoji="⭐" value={`${user.xp}`} label="XP" />
          <StatsCard emoji="🔥" value={`${user.streak}`} label="Streak" />
          <StatsCard emoji="💎" value={`${gems}`} label="Gems" />
        </View>
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

      <Pressable style={styles.customizeBtn} onPress={() => router.push('/avatar-customizer')}>
        <Text style={styles.customizeText}>🎨 Customize Avatar</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Your Items</Text>
      {inventoryQuery.isLoading ? (
        <Text style={styles.loadingText}>Loading inventory...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No items yet. Visit the shop to get some!</Text>
      ) : (
        <View style={styles.list}>
          {(filtered as any[]).map((item) => (
            <InventoryItemCard
              key={item.id}
              id={item.id}
              emoji={item.icon}
              name={item.name}
              description={item.description}
              type={item.type}
              rarity={item.rarity}
              quantity={item.quantity}
              equipped={item.equipped}
              onPress={() => {}}
              onEquip={item.type === 'avatar' ? () => handleEquip(item.id) : undefined}
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
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742', marginBottom: Spacing.three },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
    justifyContent: 'center',
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
  customizeBtn: {
    backgroundColor: Brand.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.three,
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
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
});
