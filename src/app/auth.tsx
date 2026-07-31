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
import { FormError, FormInput, FormPasswordInput } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { useLogin, useSignup } from '@/hooks/useApiQueries';
import { useSetPendingEmail, useAuthActions, useCurrentUser } from '@/hooks/useAuth';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { useSafeBack } from '@/lib/navigation';
import { Brand, Spacing } from '@/constants/theme';

type Mode = 'signup' | 'login';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const initialMode = params.mode === 'login' ? 'login' : 'signup';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [globalError, setGlobalError] = useState('');

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const signupForm = useZodForm(signupSchema, { name: '', email: '', password: '', age: 0 });
  const loginForm = useZodForm(loginSchema, { email: '', password: '' });

  const isSignup = mode === 'signup';
  const safeBack = useSafeBack('/');
  const isLoading = loginMutation.isPending || signupMutation.isPending;
  const setPendingEmail = useSetPendingEmail();
  const { login: loginAction, signup: signupAction } = useAuthActions();
  const user = useCurrentUser();

  async function handleSignup(data: { name: string; email: string; password: string; age: number }) {
    await signupMutation.mutateAsync({
      name: data.name,
      email: data.email,
      password: data.password,
      age: Number(data.age),
    });
    setPendingEmail(data.email);
    router.replace('/verify');
  }

  async function handleLogin(data: { email: string; password: string }) {
    const res = await loginMutation.mutateAsync(data);
    const token = (res.data as { token: string }).token;
    await loginAction(token);
    router.replace(user?.onboarded ? '/(tabs)' : '/onboarding');
  }

  function onPress() {
    setGlobalError('');
    const handler = isSignup
      ? signupForm.handleSubmit(handleSignup)
      : loginForm.handleSubmit(handleLogin);
    handler().catch((e) => {
      if (e instanceof Error) setGlobalError(e.message);
      else setGlobalError('Something went wrong. Please try again.');
    });
  }

  function switchMode() {
    setMode((m) => (m === 'signup' ? 'login' : 'signup'));
    setGlobalError('');
    signupForm.reset();
    loginForm.reset();
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
          <Mascot emoji={isSignup ? '🦊' : '🦸'} size={84} />
          <Text style={styles.title}>
            {isSignup ? 'Create your hero' : 'Welcome back!'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? 'Make an account to start your mission.'
              : 'Log in to continue your adventure.'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignup ? (
            <signupForm.FormProvider>
              <FormInput label="Hero name" name="name" placeholder="e.g. Alex" autoCapitalize="words" />
              <FormInput label="Email" name="email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <FormInput label="Your age" name="age" placeholder="6" keyboardType="number-pad" />
              <FormPasswordInput label="Password" name="password" placeholder="At least 6 characters" />
              {globalError && <FormError message={globalError} />}
              <Button label="Sign Up" fullWidth onPress={onPress} disabled={isLoading} />
            </signupForm.FormProvider>
          ) : (
            <loginForm.FormProvider>
              <FormInput label="Email" name="email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <FormPasswordInput label="Password" name="password" placeholder="••••••••" />
              {globalError && <FormError message={globalError} />}
              <Button label="Log In" fullWidth onPress={onPress} disabled={isLoading} />
            </loginForm.FormProvider>
          )}

          <Pressable onPress={switchMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignup
                ? 'Already have an account? Log in'
                : 'New here? Create an account'}
            </Text>
          </Pressable>
          {!isSignup && (
            <Pressable onPress={() => router.push('/forgot-password')} style={styles.switchRow}>
              <Text style={styles.switchText}>Forgot your password?</Text>
            </Pressable>
          )}
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
  switchRow: { alignItems: 'center', marginTop: Spacing.two },
  switchText: { color: Brand.primary, fontSize: 15, fontWeight: '700' },
});
