import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, setToken } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { trace } from "@/utils/debug";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  lectures: {
    all: ["lectures"] as const,
    list: (ageGroup?: string) => ["lectures", "list", ageGroup] as const,
    detail: (slug: string, ageGroup?: string) =>
      ["lectures", "detail", slug, ageGroup] as const,
  },
  curriculum: {
    sections: (ageGroup?: string) =>
      ["curriculum", "sections", ageGroup] as const,
    section: (slug: string, ageGroup?: string) =>
      ["curriculum", "section", slug, ageGroup] as const,
    units: (sectionId: string) => ["curriculum", "units", sectionId] as const,
    unit: (id: string) => ["curriculum", "unit", id] as const,
    lessons: (unitId: string) => ["curriculum", "lessons", unitId] as const,
    lesson: (id: string) => ["curriculum", "lesson", id] as const,
  },
  progress: {
    me: ["progress", "me"] as const,
  },
  gamification: {
    profile: ["gamification", "profile"] as const,
    badges: ["gamification", "badges"] as const,
    quests: ["gamification", "quests"] as const,
  },
  shop: {
    items: ["shop", "items"] as const,
    inventory: ["shop", "inventory"] as const,
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
  const group = ageGroup ?? "A";
  return useQuery({
    queryKey: queryKeys.lectures.list(ageGroup),
    queryFn: () => api.lectures.getAll(group),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLectureBySlug(slug: string, ageGroup?: string) {
  const group = ageGroup ?? "A";
  return useQuery({
    queryKey: queryKeys.lectures.detail(slug, ageGroup),
    queryFn: () => api.lectures.getBySlug(slug, group),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });
}

export function useCurriculumSections(ageGroup?: string) {
  const group = ageGroup ?? "A";
  return useQuery({
    queryKey: queryKeys.curriculum.sections(ageGroup),
    queryFn: () => api.curriculum.getSections(group),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCurriculumSection(slug: string, ageGroup?: string) {
  const group = ageGroup ?? "A";
  return useQuery({
    queryKey: queryKeys.curriculum.section(slug, ageGroup),
    queryFn: () => api.curriculum.getSection(slug, group),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });
}

export function useCurriculumUnits(sectionId: string) {
  return useQuery({
    queryKey: queryKeys.curriculum.units(sectionId),
    queryFn: () => api.curriculum.getUnits(sectionId),
    staleTime: 1000 * 60 * 5,
    enabled: !!sectionId,
  });
}

export function useCurriculumUnit(id: string) {
  return useQuery({
    queryKey: queryKeys.curriculum.unit(id),
    queryFn: () => api.curriculum.getUnit(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCurriculumLessons(unitId: string) {
  return useQuery({
    queryKey: queryKeys.curriculum.lessons(unitId),
    queryFn: () => api.curriculum.getLessons(unitId),
    staleTime: 1000 * 60 * 5,
    enabled: !!unitId,
  });
}

export function useCurriculumLesson(id: string) {
  return useQuery({
    queryKey: queryKeys.curriculum.lesson(id),
    queryFn: () => api.curriculum.getLesson(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useMyProgress() {
  const setModules = useAuthStore((s) => s.setModules);
  const data = useQuery({
    queryKey: queryKeys.progress.me,
    queryFn: async () => {
      const res = await api.progress.getMyProgress();
      return res as {
        success: boolean;
        data: { user: unknown; modules: unknown[]; lessons: unknown[] };
      };
    },
    staleTime: 0,
    gcTime: 0,
  });

  const modules =
    (data.data?.data as { modules: unknown[] } | undefined)?.modules ?? [];

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
    mutationFn: ({
      lessonId,
      score,
      correctCount,
      total,
    }: {
      lessonId: string;
      score: number;
      correctCount: number;
      total: number;
    }) => api.progress.submitLesson({ lessonId, score, correctCount, total }),
    onSuccess: (data) => {
      const result = data.data as {
        lessonProgress: unknown;
        moduleProgress: {
          lectureId: string;
          status: string;
          xpEarned: number;
          score: number;
          stars: number;
          completedAt: string | null;
        };
        xpEarned: number;
        newLevel: number;
        gemsEarned?: number;
      };
      const updatedModule = result.moduleProgress;

      if (!updatedModule?.lectureId) {
        if (__DEV__) {
          trace("useSubmitLessonProgress missing moduleProgress", { data });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.progress.me });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        return;
      }

      if (__DEV__) {
        trace("useSubmitLessonProgress success", {
          lectureId: updatedModule.lectureId,
          status: updatedModule.status,
          xpEarned: result.xpEarned,
          gemsEarned: result.gemsEarned ?? 0,
          newLevel: result.newLevel,
        });
      }

      useAuthStore.setState((state) => {
        const modules = state.modules.map((m) =>
          m.lectureId === updatedModule.lectureId
            ? { ...m, ...updatedModule }
            : m,
        );
        const newGems = (state.user?.gems ?? 0) + (result.gemsEarned ?? 0);
        return {
          user: state.user
            ? {
                ...state.user,
                xp: state.user.xp + (result.xpEarned ?? 0),
                level: result.newLevel ?? state.user.level,
                gems: newGems,
              }
            : state.user,
          modules,
        };
      });

      queryClient.setQueriesData(
        { queryKey: queryKeys.progress.me },
        (old: any) => {
          if (!old?.data?.modules) return old;
          const modules = old.data.modules.map((m: any) =>
            m.lectureId === updatedModule.lectureId
              ? { ...m, ...updatedModule }
              : m,
          );
          return {
            ...old,
            data: {
              ...old.data,
              modules,
            },
          };
        },
      );

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
    mutationFn: ({
      name,
      email,
      password,
      age,
    }: {
      name: string;
      email: string;
      password: string;
      age: number;
    }) => api.auth.signup({ name, email, password, age }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code }: { code: string }) => api.auth.verifyEmail({ code }),
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
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => api.auth.resetPassword({ email, code, newPassword }),
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

export function useQuests() {
  return useQuery({
    queryKey: [...queryKeys.gamification.quests, "all"] as const,
    queryFn: () => api.gamification.getQuests(),
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.quests });
      if (data.data?.doubleXpActivated) {
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                doubleXpActive: true,
                doubleXpSource: "shop_purchase",
              }
            : state.user,
        }));
      }
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
     mutationFn: (body: { name?: string; age?: number; avatar?: string; ageGroup?: "A" | "B"; onboarded?: boolean }) =>
      api.auth.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRecordActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: string) => api.gamification.recordActivity(action),
    onSuccess: (data) => {
      const result = data.data as {
        rewarded: boolean;
        xpEarned: number;
        gemsEarned: number;
        stats: { xp: number; level: number; leveledUp: boolean };
      };
      if (!result.rewarded) return;

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.profile,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.badges,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.quests,
      });
    },
  });
}

export function useConsumeHeart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.gamification.consumeHeart(),
    onSuccess: (data) => {
      const result = data.data as { consumed: boolean; hearts: number };
      if (!result.consumed) return;

      queryClient.setQueriesData(
        { queryKey: queryKeys.auth.me },
        (old: any) => {
          if (!old?.data?.user) return old;
          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data.user,
                hearts: result.hearts,
              },
            },
          };
        },
      );

      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, hearts: result.hearts }
          : state.user,
      }));

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.profile,
      });
    },
  });
}

export function useRefillHearts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: "gems" | "ad") =>
      api.gamification.refillHearts(method),
    onSuccess: (data) => {
      const result = data.data as {
        hearts: number;
        gemsSpent?: number;
        xpEarned?: number;
        xpSpent?: number;
        message?: string;
      };

      queryClient.setQueriesData(
        { queryKey: queryKeys.auth.me },
        (old: any) => {
          if (!old?.data?.user) return old;
          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data.user,
                hearts: result.hearts,
                ...(result.gemsSpent !== undefined
                  ? { gems: old.data.user.gems - result.gemsSpent }
                  : {}),
                ...(result.xpSpent !== undefined
                  ? { xp: old.data.user.xp - result.xpSpent }
                  : {}),
                ...(result.xpEarned !== undefined
                  ? { xp: old.data.user.xp + result.xpEarned }
                  : {}),
              },
            },
          };
        },
      );

      useAuthStore.setState((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            hearts: result.hearts,
            ...(result.gemsSpent !== undefined
              ? { gems: state.user.gems - result.gemsSpent }
              : {}),
            ...(result.xpSpent !== undefined
              ? { xp: state.user.xp - result.xpSpent }
              : {}),
            ...(result.xpEarned !== undefined
              ? { xp: state.user.xp + result.xpEarned }
              : {}),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.profile,
      });
    },
  });
}

export function useLeaderboard(scope: string = "global") {
  return useQuery({
    queryKey: ["leaderboard", scope],
    queryFn: () => api.leaderboard.get(scope),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyLeague() {
  return useQuery({
    queryKey: ["leagues", "me"],
    queryFn: () => api.leagues.getMyLeague(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useActiveEvent() {
  return useQuery({
    queryKey: ["events", "active"],
    queryFn: () => api.events.getActive(),
    staleTime: 1000 * 60 * 5,
  });
}
