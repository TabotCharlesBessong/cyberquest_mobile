import { View } from 'react-native';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { Pressable } from 'react-native';
import { Platform } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type StatsCardProps = {
  emoji: string;
  value: string | number;
  label: string;
  accent?: boolean;
  onPress?: () => void;
};

export function StatsCard({ emoji, value, label, accent, onPress }: StatsCardProps) {
  const content = (
    <View style={[styles.card, accent && styles.accentCard]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, accent && styles.accentValue]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          accent && styles.accentCard,
          pressed && { opacity: 0.7 },
          Platform.OS === 'web' && { cursor: 'pointer' },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.value, accent && styles.accentValue]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 84,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  accentCard: {
    backgroundColor: '#fff',
    borderColor: '#ffe2c2',
  },
  emoji: {
    fontSize: 22,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
  },
  accentValue: {
    color: Brand.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c869c',
    letterSpacing: 1,
    marginTop: 2,
  },
});
