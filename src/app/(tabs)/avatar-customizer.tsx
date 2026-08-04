import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing, Avatars } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useAuth';
import { useEquipItem, useRecordActivity } from '@/hooks/useApiQueries';
import { AvatarPreview } from '@/components/AvatarPreview';
import { ShopItemCard } from '@/components/ShopItemCard';
import { useSafeBack } from '@/lib/navigation';

const AVATAR_EMOJIS = Avatars;

export default function AvatarCustomizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const equipMutation = useEquipItem();
  const recordActivity = useRecordActivity();
  const safeBack = useSafeBack('/(tabs)/profile');
  const [selected, setSelected] = useState(user?.avatar || Avatars[0]);

  if (!user) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.loadingText}>Please log in to customize your avatar.</Text>
      </View>
    );
  }

  async function handleEquip(emoji: string) {
    setSelected(emoji);
  }

  async function handleApply() {
    await equipMutation.mutateAsync(selected);
    recordActivity.mutate('avatar_change');
    safeBack();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <Text style={styles.title}>Avatar Customizer</Text>

      <View style={styles.previewSection}>
        <AvatarPreview emoji={selected} size={120} label="Your Avatar" />
        <Pressable
          style={styles.applyBtn}
          onPress={handleApply}
        >
          <Text style={styles.applyText}>Apply Look</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Basic Avatars</Text>
      <View style={styles.grid}>
        {AVATAR_EMOJIS.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => setSelected(emoji)}
            style={[styles.gridItem, selected === emoji && styles.gridItemActive]}
          >
            <Text style={styles.gridEmoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Premium Avatars</Text>
      <View style={styles.list}>
        <ShopItemCard
          emoji="🦸"
          name="Hero Cape"
          description="A shiny cape for your avatar"
          cost={50}
          costType="gems"
          rarity="rare"
          onPress={() => router.push('/(tabs)/shop')}
        />
        <ShopItemCard
          emoji="🧙"
          name="Wizard Hat"
          description="A magical wizard hat"
          cost={75}
          costType="gems"
          rarity="epic"
          onPress={() => router.push('/(tabs)/shop')}
        />
        <ShopItemCard
          emoji="🧚"
          name="Glowing Wings"
          description="Sparkling fairy wings"
          cost={100}
          costType="gems"
          rarity="legendary"
          onPress={() => router.push('/(tabs)/shop')}
        />
      </View>
    </ScrollView>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#7c869c', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742', marginBottom: Spacing.four },
  previewSection: {
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  applyBtn: {
    backgroundColor: Brand.success,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Brand.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  gridItemActive: {
    borderColor: Brand.primary,
    backgroundColor: '#eef2fb',
  },
  gridEmoji: {
    fontSize: 32,
  },
  list: {
    gap: Spacing.two,
  },
});
