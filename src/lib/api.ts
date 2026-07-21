import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'cyberquest_token';
const BASE_URL = 'http://localhost:4000';

export async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined' && !('expo' in window)) {
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
  if (typeof window !== 'undefined' && !('expo' in window)) {
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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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
    let message = 'Something went wrong';
    if (typeof data === 'object' && data !== null && 'message' in data) {
      message = (data as { message: string }).message;
    } else if (typeof data === 'string') {
      message = data;
    }
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string; age: number }) =>
      request<{ success: boolean; message: string; data: { user: unknown } }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    verifyEmail: (body: { code: string }) =>
      request<{ success: boolean; message: string; data: { token: string; user: unknown } }>('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    resendVerification: (body: { email: string }) =>
      request<{ success: boolean; message: string }>('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ success: boolean; message: string; data: { token: string; user: unknown } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    forgotPassword: (body: { email: string }) =>
      request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    resetPassword: (body: { email: string; code: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getMe: () =>
      request<{ success: boolean; data: { user: unknown } }>('/api/auth/me'),
  },
  lectures: {
    getAll: (ageGroup: string) =>
      request<{ success: boolean; data: { lectures: unknown[] } }>(`/api/lectures?ageGroup=${encodeURIComponent(ageGroup)}`),
    getBySlug: (slug: string, ageGroup: string) =>
      request<{ success: boolean; data: { lecture: unknown } }>(`/api/lectures/${encodeURIComponent(slug)}?ageGroup=${encodeURIComponent(ageGroup)}`),
  },
  progress: {
    submitLesson: (body: { lessonId: string; score: number; correctCount: number; total: number }) =>
      request<{ success: boolean; message: string; data: { lessonProgress: unknown; moduleProgress: unknown; xpEarned: number; newLevel: number } }>('/api/progress/lesson', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getMyProgress: () =>
      request<{ success: boolean; data: { user: unknown; modules: unknown[]; lessons: unknown[] } }>('/api/progress/me'),
  },
};
