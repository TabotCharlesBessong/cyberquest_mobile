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
import { Mascot } from '@/components/Mascot';
import { FormError, FormInput, FormPasswordInput } from '@/components/FormComponents';
import { useZodForm } from '@/hooks/useZodForm';
import { useLogin, useSignup } from '@/hooks/useApiQueries';
import { useSetPendingEmail, useAuthActions, useCurrentUser } from '@/hooks/useAuth';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { Primary, Spacing } from '@/constants/theme';

type Mode = 'signup' | 'login';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialMode = params.mode === 'login' ? 'login' : 'signup';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [globalError, setGlobalError] = useState('');

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const signupForm = useZodForm(signupSchema, { name: '', email: '', password: '', age: 0 });
  const loginForm = useZodForm(loginSchema, { email: '', password: '' });

  const isSignup = mode === 'signup';
  const isLoading = loginMutation.isPending || signupMutation.isPending;
  const setPendingEmail = useSetPendingEmail();
  const { login: loginAction } = useAuthActions();
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
    <AuthShell
      title="CyberQuest"
      subtitle="Ready for your next mission, Hero?"
      mascot={isSignup ? '🦊' : '🦸'}
    >
      {isSignup ? (
        <signupForm.FormProvider>
          <FormInput
            label="HERO NAME"
            name="name"
            placeholder="Enter your Hero Name"
            autoCapitalize="words"
            // @ts-ignore
            leftIcon={<Text style={styles.inputIcon}>👤</Text>}
          />
          <FormInput
            label="EMAIL"
            name="email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            // @ts-ignore
            leftIcon={<Text style={styles.inputIcon}>📧</Text>}
          />
          <FormInput
            label="YOUR AGE"
            name="age"
            placeholder="6"
            keyboardType="number-pad"
            // @ts-ignore
            leftIcon={<Text style={styles.inputIcon}>📅</Text>}
          />
          <FormPasswordInput
            label="SECRET PASSWORD"
            name="password"
            placeholder="Shhh... it's a secret!"
            // @ts-ignore
            leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
          />
          {globalError && <FormError message={globalError} />}
          <Button label="Sign Up" variant="hero" fullWidth onPress={onPress} disabled={isLoading} />
        </signupForm.FormProvider>
      ) : (
        <loginForm.FormProvider>
            <FormInput
              label="EMAIL"
              name="email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              // @ts-ignore
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />
            <FormPasswordInput
              label="SECRET PASSWORD"
              name="password"
              placeholder="Shhh... it's a secret!"
              // @ts-ignore
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />
          {globalError && <FormError message={globalError} />}
          <Button label="Log In" variant="hero" fullWidth onPress={onPress} disabled={isLoading} />
        </loginForm.FormProvider>
      )}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CHOOSE PATH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialGrid}>
        <Pressable style={styles.socialBtn}>
          <Mascot emoji="🌐" size={20} bounce={false} />
          <Text style={styles.socialText}>Guest</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={switchMode}>
          <Text style={styles.footerLink}>
            {isSignup ? 'Already have an account? Log in' : 'New Hero? Create an account'}
          </Text>
        </Pressable>
        {!isSignup && (
          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.footerLink}>Forgot your password?</Text>
          </Pressable>
        )}
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  inputIcon: {
    fontSize: 20,
    color: '#727784',
    marginRight: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(114,119,132,0.2)',
  },
  dividerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(77,150,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  socialText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#414753',
    letterSpacing: 0.05,
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  footerLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: Primary.primary,
    textAlign: 'center',
  },
});
