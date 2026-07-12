import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type ProgressBarProps = {
  value: number; // 0..1
  color?: string;
  height?: number;
  trackColor?: string;
};

export function ProgressBar({
  value,
  color = '#4D96FF',
  height = 14,
  trackColor = 'rgba(0,0,0,0.08)',
}: ProgressBarProps) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, value)),
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [value, width]);

  const pct = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <Animated.View
        style={[styles.fill, { width: pct, backgroundColor: color, borderRadius: height / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
