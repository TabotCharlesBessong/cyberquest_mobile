import { StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type RewardProgressProps = {
  current: number;
  required: number;
  label?: string;
  color?: string;
};

export function RewardProgress({
  current,
  required,
  label = 'Progress',
  color = Brand.primary,
}: RewardProgressProps) {
  const pct = Math.min(Math.max(current / required, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {current} / {required}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3a4560',
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: Brand.success,
  },
  track: {
    height: 10,
    backgroundColor: '#e2e8f4',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
