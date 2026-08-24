import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormOtpInput, FormError } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { useVerifyEmail, useResendVerification } from '@/hooks/useApiQueries';
import { usePendingEmail, useSetPendingEmail, useAuthActions } from '@/hooks/useAuth';
import { verifySchema, type VerifyInput } from '@/lib/schemas';
import { Primary, Spacing } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = usePendingEmail() || (typeof params.email === 'string' ? params.email : '');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useZodForm(verifySchema, { code: '' });
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const setPendingEmail = useSetPendingEmail();
  const { signup } = useAuthActions();

  if (!email) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: Spacing.six }]}>
        <Text style={styles.errorText}>No email found. Please sign up again.</Text>
        <Button label="Go back" onPress={() => router.replace('/')} />
      </View>
    );
  }

  function onPress() {
    setError('');
    form.handleSubmit(submit)().catch((e) => {
      if (e instanceof Error) setError(e.message);
      else setError('Verification failed. Please try again.');
    });
  }

  async function submit(data: VerifyInput) {
    setLoading(true);
    try {
      const res = await verifyMutation.mutateAsync({ code: data.code });
      const token = (res.data as { token: string }).token;
      await signup(token);
      setPendingEmail(null);
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    try {
      await resendMutation.mutateAsync({ email });
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('Could not resend code.');
    }
  }

  return (
    <AuthShell
      title="CyberQuest"
      subtitle="Check your email"
      mascot="📧"
    >
      <form.FormProvider>
        <FormOtpInput
          label="Verification code"
          name="code"
          length={6}
        />
        {error && <FormError message={error} />}
        <Button label="Verify" variant="hero" fullWidth onPress={onPress} loading={loading} />
      </form.FormProvider>

      <Pressable onPress={resend} style={styles.resendRow}>
        <Text style={styles.resendText}>Didn&apos;t get it? Resend code</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  inputIcon: {
    fontSize: 20,
    color: '#727784',
    marginRight: 12,
  },
  errorText: { fontSize: 16, fontWeight: '700', color: '#BA1A1A', textAlign: 'center', marginBottom: Spacing.three },
  resendRow: { alignItems: 'center', marginTop: Spacing.two },
  resendText: { color: Primary.primary, fontSize: 15, fontWeight: '700' },
});
