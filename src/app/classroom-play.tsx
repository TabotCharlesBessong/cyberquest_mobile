import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useRecordActivity } from '@/hooks/useApiQueries';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'What should you do if a stranger messages you online?',
    options: ['Reply immediately', 'Tell a trusted adult', 'Share your address', 'Send a photo'],
    correctIndex: 1,
  },
  {
    id: '2',
    text: 'Which password is strongest?',
    options: ['123456', 'password', 'K9#mP2$vL', 'yourname'],
    correctIndex: 2,
  },
  {
    id: '3',
    text: 'A website asks for your school name and location. Should you share it?',
    options: ['Yes, it is safe', 'Only if it has a lock icon', 'No, ask an adult first', 'Only with friends'],
    correctIndex: 2,
  },
];

export default function ClassroomPlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/classroom');
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const recordActivity = useRecordActivity();
  const code = typeof params.code === 'string' ? params.code : '';

  const [questions] = useState<Question[]>(DEMO_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [starting, setStarting] = useState(true);

  const question = questions[currentIndex];

  useEffect(() => {
    if (!code || !user) return;
    const timer = setTimeout(() => {
      setStarting(false);
      recordActivity.mutate('shop_visit');
    }, 800);
    return () => clearTimeout(timer);
  }, [code, user, recordActivity]);

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.correctIndex) {
      setScore((s) => s + 10);
    }
  }

  function handleNext() {
    if (selected === null) return;
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  }

  if (starting) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.loadingText}>Joining round...</Text>
        <Text style={styles.codeText}>Code: {code}</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🏁</Text>
          <Text style={styles.title}>Round complete</Text>
          <Text style={styles.scoreText}>{score} XP earned</Text>
        </View>
        <Button label="Back to classroom" onPress={safeBack} fullWidth />
      </ScrollView>
    );
  }

  if (!question) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.four },
      ]}
    >
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1}/{questions.length}
        </Text>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + (selected !== null ? 1 : 0)) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>{question.text}</Text>
        <View style={styles.options}>
          {question.options.map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = index === question.correctIndex;
            return (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  isSelected && isCorrect && styles.optionCorrect,
                  isSelected && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => handleSelect(index)}
                disabled={selected !== null}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label={currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
        fullWidth
        disabled={selected === null}
        onPress={handleNext}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  loadingText: { fontSize: 18, fontWeight: '800', color: '#1c2742' },
  codeText: { fontSize: 14, fontWeight: '700', color: '#5b6478', marginTop: Spacing.two },
  emoji: { fontSize: 64, marginBottom: Spacing.three },
  header: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.five },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  scoreText: { fontSize: 20, fontWeight: '900', color: Brand.success },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  progressText: { fontSize: 14, fontWeight: '800', color: '#5b6478' },
  scoreLabel: { fontSize: 14, fontWeight: '800', color: Brand.success },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f4',
    borderRadius: 4,
    marginBottom: Spacing.four,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Brand.primary,
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  questionText: { fontSize: 18, fontWeight: '800', color: '#1c2742', marginBottom: Spacing.four },
  options: { gap: Spacing.two },
  option: {
    backgroundColor: '#f4f7ff',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  optionCorrect: { backgroundColor: '#e6f9ee', borderColor: Brand.success },
  optionWrong: { backgroundColor: '#ffe6e6', borderColor: Brand.danger },
  optionText: { fontSize: 15, fontWeight: '700', color: '#3a4560' },
  optionTextActive: { fontWeight: '900', color: '#1c2742' },
});
