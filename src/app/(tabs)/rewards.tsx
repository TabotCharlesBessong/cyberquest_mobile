import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Brand, Spacing } from '@/constants/theme';
import { useCurrentUser, useGems } from '@/hooks/useAuth';

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const gems = useGems();

  if (!user) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.loadingText}>Please log in to view rewards.</Text>
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
    >
      <View style={styles.header}>
        <Text style={styles.title}>Rewards Shop</Text>
        <View style={styles.gemRow}>
          <Text style={styles.gemEmoji}>💎</Text>
          <Text style={styles.gemValue}>{gems} Gems</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgeRow}>
        <BadgeCard emoji="🗺️" name="Explorer" />
        <BadgeCard emoji="💪" name="Defender" />
        <BadgeCard emoji="🐟" name="Scam Catcher" />
        <BadgeCard emoji="🏰" name="Keeper" />
        <BadgeCard emoji="🌟" name="Guardian" />
      </View>

      <Text style={styles.sectionTitle}>Shop</Text>
      <View style={styles.shopList}>
        <ShopItem emoji="🦹" name="Hero Cape" cost={50} />
        <ShopItem emoji="🎩" name="Wizard Hat" cost={75} />
        <ShopItem emoji="🦄" name="Glowing Wings" cost={100} />
        <ShopItem emoji="🎸" name="Rockstar Guitar" cost={120} />
      </View>
    </ScrollView>
  );
}

function BadgeCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <View style={styles.badgeCard}>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={styles.badgeName}>{name}</Text>
    </View>
  );
}

function ShopItem({ emoji, name, cost }: { emoji: string; name: string; cost: number }) {
  const [owned, setOwned] = useState(false);
  if (owned) {
    return (
      <View style={styles.shopItem}>
        <Text style={styles.shopEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.shopName}>{name}</Text>
          <Text style={styles.shopOwned}>Owned</Text>
        </View>
      </View>
    );
  }
  return (
    <Pressable style={styles.shopItem} onPress={() => setOwned(true)}>
      <Text style={styles.shopEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.shopName}>{name}</Text>
        <Text style={styles.shopCost}>💎 {cost}</Text>
      </View>
    </Pressable>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badgeCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  badgeEmoji: { fontSize: 36 },
  badgeName: { fontSize: 12, fontWeight: '800', color: '#3a4560', textAlign: 'center' },
  shopList: { gap: Spacing.two },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  shopEmoji: { fontSize: 36 },
  shopName: { fontSize: 16, fontWeight: '800', color: '#1c2742' },
  shopCost: { fontSize: 14, fontWeight: '700', color: '#5b6478' },
  shopOwned: { fontSize: 14, fontWeight: '700', color: Brand.success },
});
