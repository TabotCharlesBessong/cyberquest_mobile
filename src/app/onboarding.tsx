import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { Avatars, Brand, Primary, Secondary, Spacing } from '@/constants/theme';
import { useZodForm } from '@/hooks/useZodForm';
import { onboardingSchema } from '@/lib/schemas';
import { useCurrentUser, useSetUser } from '@/hooks/useAuth';

const STEPS = ['welcome', 'avatar', 'age', 'ready'] as const;
type Step = (typeof STEPS)[number];

const STEP_CONTENT: Record<
  Step,
  { emoji: string; title: string; subtitle: string }
> = {
  welcome: {
    emoji: '🦸',
    title: 'Become a Cyber Hero!',
    subtitle: 'Learn how to protect the digital realm while earning XP and badges.',
  },
  avatar: {
    emoji: '🦊',
    title: 'Pick Your Avatar',
    subtitle: 'Choose your hero identity',
  },
  age: {
    emoji: '🧒',
    title: 'Your Age Group',
    subtitle: "We'll customize your adventure",
  },
  ready: {
    emoji: '🛡️',
    title: 'Ready, Hero?',
    subtitle: "You're all set to begin your quest",
  },
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const setUser = useSetUser();
  const [step, setStep] = useState<Step>('welcome');
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

  const current = STEP_CONTENT[step];
  const isLast = step === 'ready';

  function next() {
    if (step === 'welcome') setStep('avatar');
    else if (step === 'avatar') setStep('age');
    else if (step === 'age') setStep('ready');
    else finish();
  }

  function skip() {
    finish();
  }

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
  const stepIndex = STEPS.indexOf(step);

  return (
    <View style={[styles.flex, { backgroundColor: Brand.surface }]}>
      <View style={[styles.orbContainer, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.orb, styles.orbPrimary]} />
        <Animated.View style={[styles.orb, styles.orbSecondary]} />
      </View>

      <Pressable onPress={skip} style={styles.skipBtn}>
        <Text style={styles.skipText}>SKIP</Text>
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.mascotSection}>
          <View style={styles.glowWrap}>
            <Mascot emoji={current.emoji} size={120} bounce />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </View>

        <View style={styles.body}>{renderStepBody()}</View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                i === stepIndex
                  ? { width: 32, backgroundColor: Primary.primary }
                  : { width: 8, backgroundColor: '#c1c6d5' },
              ]}
            />
          ))}
        </View>

        <View style={styles.ctaWrap}>
            <Button
              label={isLast ? 'Start Learning' : 'Next'}
              variant="hero"
              fullWidth
              onPress={next}
            />
        </View>
      </View>
    </View>
  );

  function renderStepBody() {
    if (step === 'welcome') return null;

    if (step === 'avatar') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PICK YOUR AVATAR</Text>
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
                    selected && {
                      backgroundColor: Primary.primary,
                      borderColor: Primary.primary,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (step === 'age') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR AGE GROUP</Text>
          <View style={styles.ageRow}>
            <Pressable
              onPress={() => form.setValue('ageGroup', 'A')}
              style={[
                styles.ageCard,
                selectedAgeGroup === 'A' && {
                  borderColor: Primary.primary,
                  backgroundColor: '#eef4ff',
                },
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
                selectedAgeGroup === 'B' && {
                  borderColor: Primary.primary,
                  backgroundColor: '#eef4ff',
                },
              ]}
            >
              <Text style={styles.ageEmoji}>🧑‍🚀</Text>
              <Text style={styles.ageTitle}>Ages 8–12</Text>
              <Text style={styles.ageSub}>Group B</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (step === 'ready') {
      return (
        <View style={styles.section}>
          <View style={styles.tips}>
            <Tip emoji="🌍" text="Travel through safe-world lands" />
            <Tip emoji="🎣" text="Catch scams like a pro" />
            <Tip emoji="🏰" text="Build strong password castles" />
          </View>
        </View>
      );
    }

    return null;
  }
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
  flex: { flex: 1 },
  orbContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 9999,
  },
  orbPrimary: {
    top: -100,
    left: -100,
    backgroundColor: Primary.primaryContainer,
    opacity: 0.35,
  },
  orbSecondary: {
    bottom: -100,
    right: -100,
    backgroundColor: Secondary.secondaryContainer,
    opacity: 0.35,
  },
  skipBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.four,
    zIndex: 10,
  },
  skipText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#414753',
    letterSpacing: 0.05,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 9999,
    backgroundColor: 'rgba(240,244,251,0.6)',
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  mascotSection: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  glowWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.two,
    maxWidth: 400,
  },
  title: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 28,
    fontWeight: '800',
    color: Primary.primary,
    letterSpacing: -0.02,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    fontWeight: '500',
    color: '#414753',
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  body: {
    width: '100%',
    maxWidth: 420,
    marginTop: Spacing.four,
  },
  section: { gap: Spacing.two },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Primary.primary,
    letterSpacing: 0.05,
    marginLeft: 4,
  },
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
  ageRow: { flexDirection: 'row', gap: Spacing.two },
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
  tips: { gap: Spacing.two },
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
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    height: 8,
    borderRadius: 9999,
    shadowColor: Primary.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ctaWrap: {
    width: '100%',
    maxWidth: 400,
  },
});
