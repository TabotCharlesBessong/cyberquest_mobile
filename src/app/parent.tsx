import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useUserName } from '@/hooks/useAuth';
import { useMyProgress } from '@/hooks/useApiQueries';
import { Brand, Spacing } from '@/constants/theme';

export default function ParentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const name = useUserName();
  const [confirmed, setConfirmed] = useState<string[]>([]);

  const progressQuery = useMyProgress();
  const progress = (progressQuery.data?.data as { user: { xp: number; level: number; streak: number; gems: number } } | undefined);

  if (!user) {
    router.replace('/');
    return null;
  }

  function toggleHabit(habit: string) {
    setConfirmed((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Parent Dashboard</Text>
        <Text style={styles.subtitle}>
          Track {name}'s learning journey and good habits.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Level</Text>
          <Text style={styles.summaryValue}>{progress?.user?.level ?? user.level ?? 1}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>XP</Text>
          <Text style={styles.summaryValue}>{progress?.user?.xp ?? user.xp}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Streak</Text>
          <Text style={styles.summaryValue}>{progress?.user?.streak ?? user.streak} days</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gems</Text>
          <Text style={styles.summaryValue}>{progress?.user?.gems ?? user.gems}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Habit check-in</Text>
      <View style={styles.habitList}>
        {['Used strong passwords', 'Asked before clicking links', 'Blocked a cyberbully', 'Kept info private'].map(
          (habit) => {
            const checked = confirmed.includes(habit);
            return (
              <Pressable
                key={habit}
                onPress={() => toggleHabit(habit)}
                style={[styles.habitRow, checked && styles.habitRowChecked]}
              >
                <Text style={styles.habitCheck}>{checked ? '✅' : '⬜'}</Text>
                <Text style={[styles.habitText, checked && styles.habitTextChecked]}>
                  {habit}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>

      <Text style={styles.sectionTitle}>Safety tips for parents</Text>
      <View style={styles.tips}>
        <Tip emoji="🛡️" text="Keep the computer in a common area" />
        <Tip emoji="🔒" text="Use parental controls on devices" />
        <Tip emoji="🗣️" text="Talk openly about online experiences" />
        <Tip emoji="⏰" text="Set screen-time limits together" />
      </View>

      <Button label="Done" fullWidth onPress={() => router.back()} style={styles.doneBtn} />
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
  },
  header: { marginBottom: Spacing.three },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1c2742', marginBottom: Spacing.one },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  summaryLabel: { fontSize: 15, fontWeight: '700', color: '#5b6478' },
  summaryValue: { fontSize: 15, fontWeight: '900', color: '#1c2742' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c2742',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  habitList: { gap: Spacing.two },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  habitRowChecked: { borderColor: Brand.success, backgroundColor: '#f0fff7' },
  habitCheck: { fontSize: 20 },
  habitText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#2b3552' },
  habitTextChecked: { color: '#1f7a50' },
  tips: { gap: Spacing.two },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.three,
  },
  tipEmoji: { fontSize: 22 },
  tipText: { fontSize: 15, fontWeight: '700', color: '#2b3552', flex: 1 },
  doneBtn: { marginTop: Spacing.four },
});
