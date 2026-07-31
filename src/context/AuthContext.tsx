import { useEffect, useState } from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, getToken, clearToken } from '@/lib/api';
import { Brand, Spacing } from '@/constants/theme';
import { Text, View } from 'react-native';

type AuthContextValue = {
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue>({ ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const token = await getToken();
        if (!token) {
          useAuthStore.setState({ status: 'unauthenticated', user: null, token: null, modules: [] });
          return;
        }
        try {
          const [userRes, progressRes] = await Promise.all([
            api.auth.getMe(),
            api.progress.getMyProgress(),
          ]);
          const user = userRes.data.user as any;
          const modules = (progressRes.data as any)?.data?.modules ?? [];
          if (!cancelled) {
            useAuthStore.setState({ user, token, status: 'authenticated', modules });
          }
        } catch {
          await clearToken();
          if (!cancelled) {
            useAuthStore.setState({ status: 'unauthenticated', user: null, token: null, modules: [] });
          }
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#3a4560' }}>Loading...</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={{ ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useAuthStore;
}