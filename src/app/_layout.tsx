import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { SplashOverlay } from '@/components/splash';
import { AuthProvider } from '@/context/AuthContext';
import { MaxContentWidth } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <View style={styles.container}>
            <View style={styles.content}>
              <SplashOverlay />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#F4F7FF' },
                  animation: 'slide_from_right',
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="verify" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="reset-password" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="lesson" />
                <Stack.Screen name="leaderboard" />
                <Stack.Screen name="parent" />
              </Stack>
            </View>
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    ...(Platform.OS === 'web'
      ? {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      : {}),
  },
  content: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: MaxContentWidth,
          height: '100%',
          boxShadow: '0 0 40px rgba(0,0,0,0.08)',
        }
      : {}),
  },
});
