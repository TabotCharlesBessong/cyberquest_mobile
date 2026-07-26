import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type InventoryItemCardProps = {
  id: string;
  emoji: string;
  name: string;
  description?: string;
  type: 'avatar' | 'powerup' | 'consumable';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  equipped: boolean;
  onPress?: () => void;
  onEquip?: () => void;
};

export function InventoryItemCard({
  emoji,
  name,
  description,
  type,
  rarity = 'common',
  quantity,
  equipped,
  onPress,
  onEquip,
}: InventoryItemCardProps) {
  const typeLabel = {
    avatar: 'Avatar',
    powerup: 'Power-up',
    consumable: 'Consumable',
  }[type];

  const rarityColor = {
    common: '#9aa3b5',
    rare: Brand.primary,
    epic: Brand.accent,
    legendary: Brand.warning,
  }[rarity];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.rarityBar, { backgroundColor: rarityColor }]} />
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {description && <Text style={styles.description} numberOfLines={1}>{description}</Text>}
        <View style={styles.metaRow}>
          <Text style={styles.type}>{typeLabel}</Text>
          {quantity > 1 && <Text style={styles.qty}>x{quantity}</Text>}
        </View>
        {type === 'avatar' && (
          <Pressable
            onPress={onEquip}
            style={[styles.equipBtn, equipped && styles.equippedBtn]}
          >
            <Text style={[styles.equipText, equipped && styles.equippedText]}>
              {equipped ? 'Equipped' : 'Equip'}
            </Text>
          </Pressable>
        )}
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
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
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
  type: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.primary,
    textTransform: 'uppercase',
  },
  qty: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c869c',
  },
  equipBtn: {
    marginTop: Spacing.two,
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  equippedBtn: {
    backgroundColor: Brand.success,
  },
  equipText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  equippedText: {
    color: '#fff',
  },
});
