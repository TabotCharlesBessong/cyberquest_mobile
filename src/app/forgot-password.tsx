import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormError, FormInput } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas';
import { api } from '@/lib/api';
import { Primary, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
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
    <AuthShell
      title="CyberQuest"
      subtitle="Reset your password"
      mascot="🔑"
    >
      <form.FormProvider>
        <FormInput
          label="EMAIL"
          name="email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon={<Text style={styles.inputIcon}>📧</Text>}
        />
        {error && <FormError message={error} />}
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              If an account exists, we sent a reset code to your email.
            </Text>
          </View>
        ) : (
          <Button label="Send reset code" variant="hero" fullWidth onPress={onPress} disabled={loading} />
        )}
      </form.FormProvider>

      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.backLink}>Back to login</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  inputIcon: {
    fontSize: 20,
    color: '#727784',
    marginRight: 12,
  },
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
  backLink: { color: Primary.primary, fontSize: 15, fontWeight: '700' },
});
