import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMyProgress } from './useApiQueries';

type ProgressData = {
  user: {
    id: string;
    name: string;
    email: string;
    age: number;
    ageGroup: string;
    avatar: string;
    xp: number;
    level: number;
    streak: number;
    hearts: number;
    gems: number;
  };
  badges: {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    earned: boolean;
    earnedAt: string | null;
    progress: number;
    xpReward: number;
    gemsReward: number;
  }[];
  modules: {
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
  }[];
  lessons: {
    id: string;
    lessonId: string;
    attempts: number;
    correct: number;
    bestScore: number;
    completed: boolean;
    lastResult: string | null;
  }[];
};

export function useProfileData() {
  const user = useAuthStore((s) => s.user);
  const progressQuery = useMyProgress();
  const data = (progressQuery.data?.data as ProgressData | undefined) ?? null;
  const isLoading = progressQuery.isLoading;
  const error = progressQuery.error?.message || '';

  const p = data?.user ?? user;
  const level = p?.level ?? 1;
  const completedBadges = data?.modules.filter((m) => m.status === 'completed').length ?? 0;

  return {
    user,
    data,
    isLoading,
    error,
    level,
    completedBadges,
    progressQuery,
  };
}
