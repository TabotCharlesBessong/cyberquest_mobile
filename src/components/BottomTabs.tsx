import { Stack, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

import { Brand, Spacing } from '@/constants/theme';

export function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/' || pathname === '/(tabs)';

  return (
    <View style={styles.bar}>
      <Tab active={isHome} emoji="🗺️" label="Learn" onPress={() => router.push('/')} />
      <Tab active={pathname.includes('shop')} emoji="🛒" label="Shop" onPress={() => router.push('/(tabs)/shop')} />
      <Tab active={pathname.includes('inventory')} emoji="🎒" label="Gear" onPress={() => router.push('/(tabs)/inventory')} />
      <Tab active={!isHome && pathname.includes('rewards')} emoji="💎" label="Rewards" onPress={() => router.push('/(tabs)/rewards')} />
      <Tab active={!isHome && pathname.includes('profile')} emoji="⭐" label="Profile" onPress={() => router.push('/(tabs)/profile')} />
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeef7',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2fb',
  },
  tabIconActive: { backgroundColor: Brand.primary },
  tabEmoji: { fontSize: 24 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: '#9aa3b5' },
  tabLabelActive: { color: Brand.primary },
});
