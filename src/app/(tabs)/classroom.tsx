import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useCurrentUser, useAgeGroup } from '@/hooks/useAuth';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

export default function ClassroomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/(tabs)');
  const user = useCurrentUser();
  const ageGroup = useAgeGroup();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    router.replace('/');
    return null;
  }

  async function handleJoin() {
    setError('');
    if (!code.trim()) {
      setError('Please enter a classroom code');
      return;
    }
    router.push({ pathname: '/classroom-play', params: { code: code.trim() } });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.six },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Classroom</Text>
        <Text style={styles.subtitle}>Join a live round with your class</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join with code</Text>
        <Text style={styles.cardText}>
          Enter the code your teacher gave you to join a live battle round.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          placeholderTextColor="#9aa3b5"
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
          maxLength={8}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Join round" fullWidth onPress={handleJoin} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it works</Text>
        <View style={styles.step}>
          <Text style={styles.stepNum}>1</Text>
          <Text style={styles.stepText}>Get a code from your teacher</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>2</Text>
          <Text style={styles.stepText}>Enter it here to join</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>3</Text>
          <Text style={styles.stepText}>Answer questions fast and score points</Text>
        </View>
      </View>
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
  header: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.five },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1c2742', marginBottom: Spacing.two },
  cardText: { fontSize: 14, color: '#5b6478', marginBottom: Spacing.three },
  input: {
    backgroundColor: '#f4f7ff',
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: Spacing.two,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  error: { color: Brand.danger, fontSize: 13, fontWeight: '700', marginBottom: Spacing.two },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.two },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '900',
  },
  stepText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#3a4560' },
});
