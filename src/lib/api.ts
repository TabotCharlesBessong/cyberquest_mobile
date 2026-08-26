import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cyberquest_token";
const BASE_URL = "http://localhost:4000";

export async function getToken(): Promise<string | null> {
  if (typeof window !== "undefined" && !("expo" in window)) {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token ?? null;
  } catch {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
}

export async function setToken(value: string | null) {
  if (typeof window !== "undefined" && !("expo" in window)) {
    if (value === null) await AsyncStorage.removeItem(TOKEN_KEY);
    else await AsyncStorage.setItem(TOKEN_KEY, value);
    return;
  }
  try {
    if (value === null) await SecureStore.deleteItemAsync(TOKEN_KEY);
    else await SecureStore.setItemAsync(TOKEN_KEY, value);
  } catch {
    if (value === null) await AsyncStorage.removeItem(TOKEN_KEY);
    else await AsyncStorage.setItem(TOKEN_KEY, value);
  }
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    let message = "Something went wrong";
    if (typeof data === "object" && data !== null && "message" in data) {
      message = (data as { message: string }).message;
    } else if (typeof data === "string") {
      message = data;
    }
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  auth: {
    signup: (body: {
      name: string;
      email: string;
      password: string;
      age: number;
    }) =>
      request<{ success: boolean; message: string; data: { user: unknown } }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    verifyEmail: (body: { code: string }) =>
      request<{
        success: boolean;
        message: string;
        data: { token: string; user: unknown };
      }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    resendVerification: (body: { email: string }) =>
      request<{ success: boolean; message: string }>(
        "/api/auth/resend-verification",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    login: (body: { email: string; password: string }) =>
      request<{
        success: boolean;
        message: string;
        data: { token: string; user: unknown };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    forgotPassword: (body: { email: string }) =>
      request<{ success: boolean; message: string }>(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    resetPassword: (body: {
      email: string;
      code: string;
      newPassword: string;
    }) =>
      request<{ success: boolean; message: string }>(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    getMe: () =>
      request<{ success: boolean; data: { user: unknown } }>("/api/auth/me"),
    updateProfile: (body: { name?: string; age?: number; avatar?: string; ageGroup?: "A" | "B"; onboarded?: boolean }) =>
      request<{ success: boolean; data: { user: unknown } }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
  lectures: {
    getAll: (ageGroup: string) =>
      request<{ success: boolean; data: { lectures: unknown[] } }>(
        `/api/lectures?ageGroup=${encodeURIComponent(ageGroup)}`,
      ),
    getBySlug: (slug: string, ageGroup: string) =>
      request<{ success: boolean; data: { lecture: unknown } }>(
        `/api/lectures/${encodeURIComponent(slug)}?ageGroup=${encodeURIComponent(ageGroup)}`,
      ),
  },
  curriculum: {
    getSections: (ageGroup: string) =>
      request<{ success: boolean; data: { sections: unknown[] } }>(
        `/api/curriculum/sections?ageGroup=${encodeURIComponent(ageGroup)}`,
      ),
    getSection: (slug: string, ageGroup: string) =>
      request<{ success: boolean; data: { section: unknown } }>(
        `/api/curriculum/sections/${encodeURIComponent(slug)}?ageGroup=${encodeURIComponent(ageGroup)}`,
      ),
    getUnits: (sectionId: string) =>
      request<{ success: boolean; data: { units: unknown[] } }>(
        `/api/curriculum/sections/${encodeURIComponent(sectionId)}/units`,
      ),
    getUnit: (id: string) =>
      request<{ success: boolean; data: { unit: unknown } }>(
        `/api/curriculum/units/${encodeURIComponent(id)}`,
      ),
    getLessons: (unitId: string) =>
      request<{ success: boolean; data: { lessons: unknown[] } }>(
        `/api/curriculum/units/${encodeURIComponent(unitId)}/lessons`,
      ),
    getLesson: (id: string) =>
      request<{ success: boolean; data: { lesson: unknown } }>(
        `/api/curriculum/lessons/${encodeURIComponent(id)}`,
      ),
  },
  progress: {
    submitLesson: (body: {
      lessonId: string;
      score: number;
      correctCount: number;
      total: number;
    }) =>
      request<{
        success: boolean;
        message: string;
        data: {
          lessonProgress: unknown;
          moduleProgress: unknown;
          xpEarned: number;
          newLevel: number;
        };
      }>("/api/progress/lesson", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getMyProgress: () =>
      request<{
        success: boolean;
        data: {
          user: unknown;
          modules: unknown[];
          lessons: unknown[];
          badges: unknown[];
        };
      }>("/api/progress/me"),
  },
  gamification: {
    getProfile: () =>
      request<{
        success: boolean;
        data: {
          user: unknown;
          badges: unknown[];
          dailyQuests: unknown[];
          weeklyQuests: unknown[];
          inventory: unknown[];
          stats: unknown;
        };
      }>("/api/gamification/profile"),
    getQuests: () =>
      request<{
        success: boolean;
        data: {
          daily: unknown[];
          weekly: unknown[];
        };
      }>("/api/gamification/quests"),
    getBadges: () =>
      request<{ success: boolean; data: { badges: unknown[] } }>(
        "/api/gamification/badges",
      ),
    claimQuestReward: (questId: string) =>
      request<{
        success: boolean;
        data: { xpEarned: number; gemsEarned: number };
      }>(`/api/gamification/quests/${questId}/claim`, {
        method: "POST",
      }),
    recordActivity: (action: string) =>
      request<{
        success: boolean;
        data: {
          rewarded: boolean;
          xpEarned: number;
          gemsEarned: number;
          stats: unknown;
        };
      }>("/api/gamification/activity", {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    consumeHeart: () =>
      request<{
        success: boolean;
        data: { consumed: boolean; hearts: number };
      }>("/api/gamification/hearts/consume", {
        method: "POST",
      }),
    refillHearts: (method: "gems" | "ad" | "rewards") =>
      request<{
        success: boolean;
        data: {
          hearts: number;
          gemsSpent?: number;
          xpEarned?: number;
          xpSpent?: number;
          message?: string;
        };
      }>("/api/gamification/hearts/refill", {
        method: "POST",
        body: JSON.stringify({ method }),
      }),
  },
  leaderboard: {
    get: (scope: string) =>
      request<{ success: boolean; data: { entries: unknown[] } }>(
        `/api/leaderboard?scope=${encodeURIComponent(scope)}`,
      ),
  },
  leagues: {
    getMyLeague: () =>
      request<{
        success: boolean;
        data: { league: unknown; standings: unknown[] };
      }>("/api/leagues/me"),
  },
  classroom: {
    create: (name: string, description: string) =>
      request<{ success: boolean; data: unknown }>("/api/classroom/", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      }),
    join: (code: string) =>
      request<{ success: boolean; data: unknown }>("/api/classroom/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    startRound: (classroomId: string, questions: unknown[]) =>
      request<{ success: boolean; data: unknown }>(
        `/api/classroom/${classroomId}/round/start`,
        {
          method: "POST",
          body: JSON.stringify({ questions }),
        },
      ),
    submitAnswer: (
      roundId: string,
      questionId: string,
      selectedIndex: number,
      correctIndex: number,
    ) =>
      request<{ success: boolean; data: unknown }>(
        `/api/classroom/rounds/${roundId}/answer`,
        {
          method: "POST",
          body: JSON.stringify({ questionId, selectedIndex, correctIndex }),
        },
      ),
    finishRound: (roundId: string) =>
      request<{ success: boolean; data: unknown }>(
        `/api/classroom/rounds/${roundId}/finish`,
        {
          method: "POST",
        },
      ),
  },
  events: {
    getActive: () =>
      request<{ success: boolean; data: unknown }>("/api/events/active"),
  },
  shop: {
    getItems: () =>
      request<{ success: boolean; data: { items: unknown[] } }>(
        "/api/shop/items",
      ),
    purchase: (itemId: string) =>
      request<{
        success: boolean;
        data: { success: boolean; item: unknown; remainingCurrency: number; doubleXpActivated?: boolean };
      }>("/api/shop/purchase", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      }),
    getInventory: () =>
      request<{ success: boolean; data: { inventory: unknown[] } }>(
        "/api/shop/inventory",
      ),
    equipItem: (itemId: string) =>
      request<{
        success: boolean;
        data: { success: boolean; equipped: string };
      }>(`/api/shop/equip/${itemId}`, {
        method: "POST",
      }),
    unequipItem: (itemId: string) =>
      request<{
        success: boolean;
        data: { success: boolean; unequipped: string };
      }>(`/api/shop/unequip/${itemId}`, {
        method: "POST",
      }),
  },
};
