import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLectures, useMyProgress, useDailyQuests } from './useApiQueries';
import { trace } from '@/utils/debug';

type Lecture = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  order: number;
  lessons: unknown[];
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
  const lecturesQuery = useLectures(user?.ageGroup ?? 'A');
  const progressQuery = useMyProgress();
  const questsQuery = useDailyQuests();

  const lectures = (lecturesQuery.data?.data as { lectures: Lecture[] } | undefined)?.lectures ?? [];
  const modules = storeModules.length > 0 ? storeModules : (progressQuery.data?.data as { modules: ModuleProgress[] } | undefined)?.modules ?? [];
  const quests = (questsQuery.data?.data as { dailyQuests: DailyQuest[] } | undefined)?.dailyQuests ?? [];
  const xp = user?.xp ?? 0;
  const xpForNext = 100;
  const xpIntoLevel = xp % xpForNext;
  const isLoading = lecturesQuery.isLoading || progressQuery.isLoading || questsQuery.isLoading;
  const error = lecturesQuery.error?.message || progressQuery.error?.message || questsQuery.error?.message || '';
  const isRefreshing = lecturesQuery.isFetching || progressQuery.isFetching || questsQuery.isFetching;

  const completedCount = modules.filter((m) => m.status === 'completed').length;

  function isUnlocked(index: number) {
    if (index === 0) return true;
    const prev = lectures[index - 1];
    const prevProgress = modules.find((m) => m.lectureId === prev.id);
    const unlocked = prevProgress?.status === 'completed';

    trace('isUnlocked', {
      index,
      lectureId: prev.id,
      lectureSlug: prev.slug,
      moduleStatus: prevProgress?.status,
      unlocked,
      storeModulesCount: storeModules.length,
    });

    return unlocked;
  }

  const onRefresh = useCallback(() => {
    lecturesQuery.refetch();
    progressQuery.refetch();
    questsQuery.refetch();
  }, [lecturesQuery, progressQuery, questsQuery]);

  return {
    user,
    lectures,
    modules,
    quests,
    xp,
    xpForNext,
    xpIntoLevel,
    isLoading,
    error,
    isRefreshing,
    completedCount,
    total: lectures.length,
    isUnlocked,
    onRefresh,
    lecturesQuery,
    progressQuery,
    questsQuery,
  };
}
