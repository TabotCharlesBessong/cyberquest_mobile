import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  useCurriculumSections,
  useMyProgress,
  useQuests,
} from "./useApiQueries";
import { trace } from "@/utils/debug";

type Section = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  order: number;
  units: unknown[];
};

type ModuleProgress = {
  id: string;
  lectureId: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  status: string;
  score: number;
  stars: number;
  xpEarned: number;
  completedAt: string | null;
};

type DailyQuest = {
  id: string;
  key: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  xpReward: number;
  gemsReward: number;
  expiresAt: string;
};

export function useHomeData() {
  const user = useAuthStore((s) => s.user);
  const storeModules = useAuthStore((s) => s.modules);
  const sectionsQuery = useCurriculumSections(user?.ageGroup ?? "A");
  const progressQuery = useMyProgress();
  const questsQuery = useQuests();

  const sections =
    (sectionsQuery.data?.data as { sections: Section[] } | undefined)
      ?.sections ?? [];
  const modules =
    storeModules.length > 0
      ? storeModules
      : ((progressQuery.data?.data as { modules: ModuleProgress[] } | undefined)
          ?.modules ?? []);
  const quests =
    (questsQuery.data?.data as { daily: DailyQuest[]; weekly: DailyQuest[] } | undefined)
      ?.daily ?? [];
  const weeklyQuests =
    (questsQuery.data?.data as { daily: DailyQuest[]; weekly: DailyQuest[] } | undefined)
      ?.weekly ?? [];
  const xp = user?.xp ?? 0;
  const xpForNext = 100;
  const xpIntoLevel = xp % xpForNext;
  const isLoading =
    sectionsQuery.isLoading || progressQuery.isLoading || questsQuery.isLoading;
  const error =
    sectionsQuery.error?.message ||
    progressQuery.error?.message ||
    questsQuery.error?.message ||
    "";
  const isRefreshing =
    sectionsQuery.isFetching ||
    progressQuery.isFetching ||
    questsQuery.isFetching;

  const completedCount = modules.filter((m) => m.status === "completed").length;

  function isUnlocked(index: number) {
    if (index === 0) return true;
    const prev = sections[index - 1];
    const prevProgress = modules.find((m) => m.lectureId === prev.id);
    const unlocked = prevProgress?.status === "completed";

    trace("isUnlocked", {
      index,
      sectionId: prev.id,
      sectionSlug: prev.slug,
      moduleStatus: prevProgress?.status,
      unlocked,
      storeModulesCount: storeModules.length,
    });

    return unlocked;
  }

  const onRefresh = useCallback(() => {
    sectionsQuery.refetch();
    progressQuery.refetch();
    questsQuery.refetch();
  }, [sectionsQuery, progressQuery, questsQuery]);

  return {
    user,
    lectures: sections,
    modules,
    quests,
    weeklyQuests,
    xp,
    xpForNext,
    xpIntoLevel,
    isLoading,
    error,
    isRefreshing,
    completedCount,
    total: sections.length,
    isUnlocked,
    onRefresh,
    sectionsQuery,
    progressQuery,
    questsQuery,
  };
}
