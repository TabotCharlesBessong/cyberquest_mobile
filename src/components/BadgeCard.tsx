import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type BadgeCardProps = {
  emoji: string;
  name: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
  onPress?: () => void;
};

export function BadgeCard({
  emoji,
  name,
  description,
  rarity = 'common',
  earned = true,
  onPress,
}: BadgeCardProps) {
  const rarityColor = {
    common: '#9aa3b5',
    rare: Brand.primary,
    epic: Brand.accent,
    legendary: Brand.warning,
  }[rarity];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        !earned && styles.lockedCard,
        pressed && onPress && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.rarityBar, { backgroundColor: rarityColor }]} />
      <Text style={[styles.emoji, !earned && styles.lockedEmoji]}>{earned ? emoji : '🔒'}</Text>
      <Text style={[styles.name, !earned && styles.lockedName]} numberOfLines={1}>
        {name}
      </Text>
      {description && (
        <Text style={[styles.description, !earned && styles.lockedDesc]} numberOfLines={2}>
          {description}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    backgroundColor: Brand.card,
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#e2e8f4',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.5,
  },
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  emoji: {
    fontSize: 36,
    marginTop: 4,
  },
  lockedEmoji: {
    opacity: 0.6,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3a4560',
    textAlign: 'center',
  },
  lockedName: {
    color: '#9aa3b5',
  },
  description: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7c869c',
    textAlign: 'center',
    minHeight: 28,
  },
  lockedDesc: {
    color: '#b0b4ba',
  },
});
