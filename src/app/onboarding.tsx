import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { Avatars, Brand, Spacing } from '@/constants/theme';
import { auth } from '@/lib/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(auth.getCurrentUser());
  const [avatar, setAvatar] = useState(user?.avatar ?? '🦊');

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    setAvatar(user.avatar);
  }, [user, router]);

  function finish() {
    if (!user) return;
    const updated = { ...user, avatar, onboarded: true };
    auth.updateUser(updated);
    router.replace('/(tabs)');
  }

  if (!user) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
      <View style={styles.header}>
        <Mascot emoji={avatar} size={104} />
        <Text style={styles.title}>Hi {user.name}! 👋</Text>
        <Text style={styles.subtitle}>Pick a hero avatar for your adventure.</Text>
      </View>

      <View style={styles.avatarGrid}>
        {Avatars.map((a) => {
          const selected = a === avatar;
          return (
            <Pressable
              key={a}
              onPress={() => setAvatar(a)}
              style={[
                styles.avatarCell,
                selected && { backgroundColor: Brand.primary, borderColor: Brand.primaryDark },
              ]}>
              <Text style={styles.avatarEmoji}>{a}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tips}>
        <Tip emoji="🌍" text="Travel through 5 safe-world lands" />
        <Tip emoji="🎣" text="Catch scams like a pro" />
        <Tip emoji="🏰" text="Build strong password castles" />
      </View>

      <Button label="Start Learning" fullWidth onPress={finish} style={styles.start} />
    </ScrollView>
  );
}

function Tip({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.tip}>
      <Text style={styles.tipEmoji}>{emoji}</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
    gap: Spacing.four,
  },
  header: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three },
  title: { fontSize: 30, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478', textAlign: 'center' },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    maxWidth: 360,
  },
  avatarCell: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f4',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatarEmoji: { fontSize: 34 },
  tips: { width: '100%', maxWidth: 420, gap: Spacing.two },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
  },
  tipEmoji: { fontSize: 26 },
  tipText: { fontSize: 15, fontWeight: '700', color: '#2b3552' },
  start: { marginTop: Spacing.three },
});
