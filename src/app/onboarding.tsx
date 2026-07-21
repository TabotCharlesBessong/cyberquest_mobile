import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { FormProvider } from '@/components/FormComponents';
import { Avatars, Brand, Spacing } from '@/constants/theme';
import { useZodForm } from '@/hooks/useZodForm';
import { onboardingSchema } from '@/lib/schemas';
import { useCurrentUser, useSetUser } from '@/hooks/useAuth';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const setUser = useSetUser();
  const [avatar, setAvatar] = useState(user?.avatar ?? '🦊');

  const form = useZodForm(onboardingSchema, {
    ageGroup: user?.ageGroup === 'B' ? 'B' : 'A',
    avatar: user?.avatar ?? '🦊',
  });

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    if (user.ageGroup) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  if (!user) return null;

  function finish() {
    const data = form.getValues();
    const updated = {
      ...user,
      avatar: data.avatar,
      ageGroup: data.ageGroup,
      onboarded: true,
    };
    setUser(updated as any);
    router.replace('/(tabs)');
  }

  const selectedAgeGroup = form.watch('ageGroup');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.four },
      ]}
    >
      <View style={styles.header}>
        <Mascot emoji={avatar} size={104} />
        <Text style={styles.title}>Hi {user.name}! 👋</Text>
        <Text style={styles.subtitle}>Let's set up your hero profile.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pick your avatar</Text>
        <View style={styles.avatarGrid}>
          {Avatars.map((a) => {
            const selected = a === avatar;
            return (
              <Pressable
                key={a}
                onPress={() => {
                  setAvatar(a);
                  form.setValue('avatar', a);
                }}
                style={[
                  styles.avatarCell,
                  selected && { backgroundColor: Brand.primary, borderColor: Brand.primaryDark },
                ]}
              >
                <Text style={styles.avatarEmoji}>{a}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your age group</Text>
        <View style={styles.ageGroupRow}>
          <Pressable
            onPress={() => form.setValue('ageGroup', 'A')}
            style={[
              styles.ageCard,
              selectedAgeGroup === 'A' && { borderColor: Brand.primary, backgroundColor: '#eef4ff' },
            ]}
          >
            <Text style={styles.ageEmoji}>🧒</Text>
            <Text style={styles.ageTitle}>Ages 6–8</Text>
            <Text style={styles.ageSub}>Group A</Text>
          </Pressable>
          <Pressable
            onPress={() => form.setValue('ageGroup', 'B')}
            style={[
              styles.ageCard,
              selectedAgeGroup === 'B' && { borderColor: Brand.primary, backgroundColor: '#eef4ff' },
            ]}
          >
            <Text style={styles.ageEmoji}>🧑‍🚀</Text>
            <Text style={styles.ageTitle}>Ages 8–12</Text>
            <Text style={styles.ageSub}>Group B</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tips}>
        <Tip emoji="🌍" text="Travel through safe-world lands" />
        <Tip emoji="🎣" text="Catch scams like a pro" />
        <Tip emoji="🏰" text="Build strong password castles" />
      </View>

      <form.FormProvider>
        <Button label="Start Learning" fullWidth onPress={() => form.handleSubmit(finish)()} style={styles.start} />
      </form.FormProvider>
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
  section: { width: '100%', maxWidth: 420, gap: Spacing.two },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: '#3a4560', marginLeft: 4 },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
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
  ageGroupRow: { flexDirection: 'row', gap: Spacing.two },
  ageCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  ageEmoji: { fontSize: 36 },
  ageTitle: { fontSize: 16, fontWeight: '800', color: '#1c2742' },
  ageSub: { fontSize: 12, fontWeight: '700', color: '#7c869c' },
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
