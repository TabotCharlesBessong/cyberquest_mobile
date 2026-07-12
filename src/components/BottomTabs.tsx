import { Stack, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Spacing } from '@/constants/theme';

export function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/' || pathname === '/(tabs)';

  return (
    <View style={styles.bar}>
      <Tab
        active={isHome}
        emoji="🗺️"
        label="Learn"
        onPress={() => router.push('/')}
      />
      <Tab
        active={!isHome}
        emoji="⭐"
        label="Profile"
        onPress={() => router.push('/profile')}
      />
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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <View style={[styles.tabIconWrap, active && styles.tabIconActive]}>
        <Text style={styles.tabEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
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
  pressed: { opacity: 0.6 },
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
