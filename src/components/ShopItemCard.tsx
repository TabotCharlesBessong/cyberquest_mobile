import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type ShopItemCardProps = {
  emoji: string;
  name: string;
  description: string;
  cost: number;
  costType?: 'gems' | 'xp';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  owned?: boolean;
  equipped?: boolean;
  onPress?: () => void;
};

export function ShopItemCard({
  emoji,
  name,
  description,
  cost,
  costType = 'gems',
  rarity = 'common',
  owned = false,
  equipped = false,
  onPress,
}: ShopItemCardProps) {
  const rarityColor = {
    common: '#9aa3b5',
    rare: Brand.primary,
    epic: Brand.accent,
    legendary: Brand.warning,
  }[rarity];

  return (
    <Pressable
      onPress={onPress}
      disabled={owned}
      style={({ pressed }) => [
        styles.card,
        owned && styles.ownedCard,
        pressed && !owned && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.rarityBar, { backgroundColor: rarityColor }]} />
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.cost}>
            {costType === 'gems' ? '💎' : '⭐'} {cost}
          </Text>
          {owned && (
            <Text style={[styles.status, equipped && styles.equippedStatus]}>
              {equipped ? 'Equipped' : 'Owned'}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Brand.card,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  ownedCard: {
    opacity: 0.75,
  },
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  emoji: {
    fontSize: 44,
    width: 64,
    height: 64,
    textAlign: 'center',
    lineHeight: 64,
    backgroundColor: Brand.surface,
    borderRadius: 18,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c2742',
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c869c',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  cost: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5b6478',
  },
  status: {
    fontSize: 12,
    fontWeight: '800',
    color: Brand.success,
    textTransform: 'uppercase',
  },
  equippedStatus: {
    color: Brand.primary,
  },
});
