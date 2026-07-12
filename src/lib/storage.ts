import type { Progress, User } from '@/data/types';

const STORAGE_KEY = 'cybersafe_kids_v1';

type Store = {
  accounts: Record<string, User>;
  currentUserId: string | null;
  progress: Record<string, Progress>;
};

const hasLocalStorage = typeof localStorage !== 'undefined';

function emptyProgress(): Progress {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completedModules: [],
    completedLessons: [],
    badges: [],
  };
}

function readStore(): Store {
  if (hasLocalStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Store;
    } catch {
      // ignore corrupted storage
    }
  }
  return { accounts: {}, currentUserId: null, progress: {} };
}

function writeStore(store: Store) {
  if (hasLocalStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore write failures
    }
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(progress: Progress): Progress {
  const todayStr = today();
  if (progress.lastActiveDate === todayStr) return progress;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = progress.lastActiveDate === yesterday ? progress.streak + 1 : 1;
  return { ...progress, lastActiveDate: todayStr, streak };
}

export const auth = {
  getCurrentUser(): User | null {
    const store = readStore();
    if (!store.currentUserId) return null;
    return store.accounts[store.currentUserId] ?? null;
  },

  signUp(name: string, age: number, password: string): User {
    const store = readStore();
    const id = name.trim().toLowerCase();
    const user: User = {
      id,
      name: name.trim(),
      age,
      avatar: '🦊',
      password,
      onboarded: false,
      createdAt: new Date().toISOString(),
    };
    store.accounts[id] = user;
    store.currentUserId = id;
    if (!store.progress[id]) store.progress[id] = emptyProgress();
    writeStore(store);
    return user;
  },

  login(name: string, password: string): User | null {
    const store = readStore();
    const id = name.trim().toLowerCase();
    const user = store.accounts[id];
    if (!user || user.password !== password) return null;
    store.currentUserId = id;
    writeStore(store);
    return user;
  },

  logout() {
    const store = readStore();
    store.currentUserId = null;
    writeStore(store);
  },

  updateUser(updated: User) {
    const store = readStore();
    store.accounts[updated.id] = updated;
    writeStore(store);
  },

  getProgress(user: User): Progress {
    const store = readStore();
    return store.progress[user.id] ?? emptyProgress();
  },

  saveProgress(user: User, progress: Progress) {
    const store = readStore();
    store.progress[user.id] = progress;
    writeStore(store);
  },

  recordModuleComplete(user: User, moduleId: string, badge: string, badgeName: string, lessonIds: string[]) {
    const progress = updateStreak(this.getProgress(user));
    const completedLessons = Array.from(new Set([...progress.completedLessons, ...lessonIds]));
    const completedModules = progress.completedModules.includes(moduleId)
      ? progress.completedModules
      : [...progress.completedModules, moduleId];
    const badges = progress.badges.includes(badgeName)
      ? progress.badges
      : [...progress.badges, badgeName];
    const xp = progress.xp + 30;
    const next: Progress = { ...progress, xp, completedModules, completedLessons, badges };
    this.saveProgress(user, next);
    return next;
  },
};
