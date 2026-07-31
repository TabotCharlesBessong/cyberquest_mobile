import { StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type AvatarPreviewProps = {
  emoji: string;
  size?: number;
  label?: string;
};

export function AvatarPreview({ emoji, size = 80, label }: AvatarPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.ring, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]}>
        <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.emoji, { fontSize: size * 0.55 }]}>{emoji}</Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  ring: {
    borderWidth: 4,
    borderColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
    lineHeight: undefined,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c869c',
    textAlign: 'center',
  },
});
