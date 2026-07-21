import { useAuthStore } from '@/stores/authStore';

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useGems() {
  return useAuthStore((s) => s.user?.gems ?? 0);
}

export function useAgeGroup() {
  return useAuthStore((s) => s.user?.ageGroup ?? null);
}

export function useUserName() {
  return useAuthStore((s) => s.user?.name);
}

export function useUserAvatar() {
  return useAuthStore((s) => s.user?.avatar);
}

export function useUserStats() {
  const user = useAuthStore((s) => s.user);
  return {
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
    streak: user?.streak ?? 0,
    hearts: user?.hearts ?? 0,
    gems: user?.gems ?? 0,
    name: user?.name,
    avatar: user?.avatar,
    ageGroup: user?.ageGroup,
    onboarded: user?.onboarded,
  };
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.status === 'authenticated');
}

export function useLogout() {
  return useAuthStore((s) => s.logout);
}

export function usePendingEmail() {
  return useAuthStore((s) => s.pendingEmail);
}

export function useSetPendingEmail() {
  return useAuthStore((s) => s.setPendingEmail);
}

export function useAuthActions() {
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const logout = useAuthStore((s) => s.logout);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  return { login, signup, logout, setPendingEmail };
}

export function useUpdateUser() {
  return useAuthStore((s) => s.user);
}

export function useSetUser() {
  return useAuthStore.setState;
}
