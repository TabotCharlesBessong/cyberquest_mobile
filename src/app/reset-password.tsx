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
import { FormOtpInput, FormError, FormInput, FormPasswordInput } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas';
import { api } from '@/lib/api';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack('/');
  const email = typeof params.email === 'string' ? params.email : '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useZodForm(resetPasswordSchema, { email: email || "", code: "", newPassword: "" });

  function onPress() {
    setError('');
    form.handleSubmit(submit)().catch((e) => {
      if (e instanceof Error) setError(e.message);
      else setError('Reset failed. Please try again.');
    });
  }

  async function submit(data: ResetPasswordInput) {
    setLoading(true);
    try {
      await api.auth.resetPassword({ email: data.email, code: data.code, newPassword: data.newPassword });
      router.replace({ pathname: '/auth', params: { mode: 'login' } });
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('Reset failed. Please try again.');
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
        <Pressable style={styles.back} onPress={safeBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Mascot emoji="🔒" size={84 } />
          <Text style={styles.title}>Choose a new password</Text>
          <Text style={styles.subtitle}>
            Enter the code from your email and a new password.
          </Text>
        </View>

        <View style={styles.form}>
          <form.FormProvider>
            <FormInput label="Email" name="email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <FormOtpInput label="Reset code" name="code" length={6} />
            <FormPasswordInput label="New password" name="newPassword" placeholder="At least 6 characters" />
            {error && <FormError message={error} />}
            <Button label="Reset password" fullWidth onPress={onPress} loading={loading} />
          </form.FormProvider>
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
});
