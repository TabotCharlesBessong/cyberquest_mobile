import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

import { Brand, Rounded, Secondary, Surface, Spacing } from '@/constants/theme';

const TABS = [
  { label: 'Missions', emoji: '🗺️', route: '/(tabs)' },
  { label: 'Class', emoji: '🎓', route: '/(tabs)/classroom' },
  { label: 'Rank', emoji: '🏆', route: '/(tabs)/leaderboard' },
  { label: 'Avatar', emoji: '🧒', route: '/(tabs)/avatar-customizer' },
  { label: 'Stats', emoji: '📊', route: '/(tabs)/profile' },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.route === '/(tabs)'
          ? pathname === '/' || pathname === '/(tabs)' || pathname.startsWith('/(tabs)/section')
          : pathname.includes(tab.route);
        return (
          <Tab
            key={tab.label}
            active={isActive}
            emoji={tab.emoji}
            label={tab.label}
            onPress={() => router.push(tab.route)}
          />
        );
      })}
    </View>
  );
}

function Tab({
  active,
  emoji,
  label,
  onPress,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 1 : 0.9,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, scale, opacity]);

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Animated.View
        style={[
          styles.tabIconWrap,
          active && styles.tabIconActive,
          { transform: [{ scale }], opacity },
        ]}
      >
        <Text style={styles.tabEmoji}>{emoji}</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          active && styles.tabLabelActive,
          { opacity },
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248,249,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three + Spacing.half,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    shadowColor: Brand.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    borderRadius: Rounded.md,
  },
  tabIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Surface.surfaceContainerLow,
  },
  tabIconActive: {
    backgroundColor: Secondary.secondaryContainer,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Surface.onSurfaceVariant,
    marginTop: Spacing.two,
  },
  tabLabelActive: {
    color: Secondary.onSecondaryContainer,
  },
});