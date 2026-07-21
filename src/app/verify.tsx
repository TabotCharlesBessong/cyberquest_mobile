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
import { FormCodeInput, FormError } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { useVerifyEmail, useResendVerification } from '@/hooks/useApiQueries';
import { usePendingEmail, useSetPendingEmail, useAuthActions } from '@/hooks/useAuth';
import { verifySchema, type VerifyInput } from '@/lib/schemas';
import { Brand, Spacing } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
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
          <Mascot emoji="📧" size={84} />
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email || 'your email'}
          </Text>
        </View>

        <View style={styles.form}>
          <form.FormProvider>
            <FormCodeInput label="Verification code" name="code" />
            {error && <FormError message={error} />}
            <Button label="Verify" fullWidth onPress={onPress} disabled={loading} />
          </form.FormProvider>
          <Pressable onPress={resend} style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't get it? Resend code</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
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
  errorText: { fontSize: 16, fontWeight: '700', color: Brand.danger, textAlign: 'center', marginBottom: Spacing.three },
  resendRow: { alignItems: 'center', marginTop: Spacing.one },
  resendText: { color: Brand.primary, fontSize: 15, fontWeight: '700' },
});
