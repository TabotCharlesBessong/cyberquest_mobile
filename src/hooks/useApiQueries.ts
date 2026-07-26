import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api, setToken } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { trace } from '@/utils/debug';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  lectures: {
    all: ['lectures'] as const,
    list: (ageGroup?: string) => ['lectures', 'list', ageGroup] as const,
    detail: (slug: string, ageGroup?: string) => ['lectures', 'detail', slug, ageGroup] as const,
  },
  progress: {
    me: ['progress', 'me'] as const,
  },
  gamification: {
    profile: ['gamification', 'profile'] as const,
    badges: ['gamification', 'badges'] as const,
    quests: ['gamification', 'quests'] as const,
  },
  shop: {
    items: ['shop', 'items'] as const,
    inventory: ['shop', 'inventory'] as const,
  },
};

export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.auth.getMe(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useLectures(ageGroup?: string) {
  const group = ageGroup ?? 'A';
  return useQuery({
    queryKey: queryKeys.lectures.list(ageGroup),
    queryFn: () => api.lectures.getAll(group),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLectureBySlug(slug: string, ageGroup?: string) {
  const group = ageGroup ?? 'A';
  return useQuery({
    queryKey: queryKeys.lectures.detail(slug, ageGroup),
    queryFn: () => api.lectures.getBySlug(slug, group),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });
}

export function useMyProgress() {
  const setModules = useAuthStore((s) => s.setModules);
  const data = useQuery({
    queryKey: queryKeys.progress.me,
    queryFn: async () => {
      const res = await api.progress.getMyProgress();
      return res as { success: boolean; data: { user: unknown; modules: unknown[]; lessons: unknown[] } };
    },
    staleTime: 0,
    gcTime: 0,
  });

  const modules = (data.data?.data as { modules: unknown[] } | undefined)?.modules ?? [];

  useEffect(() => {
    if (modules.length > 0) {
      setModules(modules as any);
    }
  }, [modules, setModules]);

  return data;
}

export function useSubmitLessonProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, score, correctCount, total }: { lessonId: string; score: number; correctCount: number; total: number }) =>
      api.progress.submitLesson({ lessonId, score, correctCount, total }),
    onSuccess: (data) => {
      const result = data.data as { lessonProgress: unknown; moduleProgress: { lectureId: string; status: string; xpEarned: number; score: number; stars: number; completedAt: string | null }; xpEarned: number; newLevel: number };
      const updatedModule = result.moduleProgress;

      if (__DEV__) {
        trace('useSubmitLessonProgress success', {
          lectureId: updatedModule.lectureId,
          status: updatedModule.status,
          xpEarned: result.xpEarned,
          newLevel: result.newLevel,
        });
      }

      useAuthStore.setState((state) => {
        const modules = state.modules.map((m) =>
          m.lectureId === updatedModule.lectureId
            ? { ...m, ...updatedModule }
            : m
        );
        return {
          user: state.user ? { ...state.user, xp: state.user.xp + result.xpEarned, level: result.newLevel } : state.user,
          modules,
        };
      });

      queryClient.setQueriesData({ queryKey: queryKeys.progress.me }, (old: any) => {
        if (!old?.data?.modules) return old;
        const modules = old.data.modules.map((m: any) =>
          m.lectureId === updatedModule.lectureId
            ? { ...m, ...updatedModule }
            : m
        );
        return {
          ...old,
          data: {
            ...old.data,
            modules,
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.progress.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login({ email, password }),
    onSuccess: async (data) => {
      const token = (data.data as { token: string }).token;
      await setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, email, password, age }: { name: string; email: string; password: string; age: number }) =>
      api.auth.signup({ name, email, password, age }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code }: { code: string }) =>
      api.auth.verifyEmail({ code }),
    onSuccess: async (data) => {
      const token = (data.data as { token: string }).token;
      await setToken(token);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      api.auth.resendVerification({ email }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      api.auth.forgotPassword({ email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      api.auth.resetPassword({ email, code, newPassword }),
  });
}

export function useGamificationProfile() {
  return useQuery({
    queryKey: queryKeys.gamification.profile,
    queryFn: () => api.gamification.getProfile(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: queryKeys.gamification.badges,
    queryFn: () => api.gamification.getBadges(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDailyQuests() {
  return useQuery({
    queryKey: queryKeys.gamification.quests,
    queryFn: () => api.gamification.getProfile(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useShopItems() {
  return useQuery({
    queryKey: queryKeys.shop.items,
    queryFn: () => api.shop.getItems(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.shop.inventory,
    queryFn: () => api.shop.getInventory(),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.shop.purchase(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useEquipItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.shop.equipItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRecordActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: string) => api.gamification.recordActivity(action),
    onSuccess: (data) => {
      const result = data.data as { rewarded: boolean; xpEarned: number; gemsEarned: number; stats: { xp: number; level: number; leveledUp: boolean } };
      if (!result.rewarded) return;

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.badges });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.quests });
    },
  });
}
