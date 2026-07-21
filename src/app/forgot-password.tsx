import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { FormError, FormInput } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas';
import { api } from '@/lib/api';
import { Brand, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useZodForm(forgotPasswordSchema, { email: '' });

  function onPress() {
    setError('');
    form.handleSubmit(submit)().catch((e) => {
      if (e instanceof Error) setError(e.message);
      else setError('Something went wrong. Please try again.');
    });
  }

  async function submit(data: ForgotPasswordInput) {
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email: data.email });
      setSent(true);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.four },
        ]}
        keyboardShouldPersistTaps="always"
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Mascot emoji="🔑" size={84} />
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset code.
          </Text>
        </View>

        <View style={styles.form}>
          <form.FormProvider>
            <FormInput label="Email" name="email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            {error && <FormError message={error} />}
            {sent ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  If an account exists, we sent a reset code to your email.
                </Text>
              </View>
            ) : (
              <Button label="Send reset code" fullWidth onPress={onPress} disabled={loading} />
            )}
          </form.FormProvider>

          <Pressable onPress={() => router.back()} style={styles.backRow}>
            <Text style={styles.backLink}>Back to login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  back: { paddingVertical: Spacing.two },
  backText: { color: Brand.primary, fontSize: 16, fontWeight: '700' },
  header: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.four },
  title: { fontSize: 28, fontWeight: '900', color: '#1c2742' },
  subtitle: { fontSize: 15, color: '#5b6478', textAlign: 'center' },
  form: { marginTop: Spacing.five, gap: Spacing.four },
  successBox: {
    backgroundColor: '#e3f8ef',
    borderRadius: 16,
    padding: Spacing.three,
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f7a50',
    textAlign: 'center',
  },
  backRow: { alignItems: 'center', marginTop: Spacing.two },
  backLink: { color: Brand.primary, fontSize: 15, fontWeight: '700' },
});
